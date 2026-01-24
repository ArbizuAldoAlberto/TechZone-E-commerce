import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let isInitialized = false;
let dbPromise = null;

const getDb = async () => {
    if (dbPromise) return dbPromise;

    dbPromise = (async () => {
        try {
            const database = await SQLite.openDatabaseAsync('techzone.db');

            // ENSURE TABLES EXIST
            await database.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS sessions (
                  localId TEXT PRIMARY KEY NOT NULL,
                  email TEXT NOT NULL,
                  token TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS pending_cart_items (
                  id TEXT PRIMARY KEY NOT NULL,
                  productId TEXT NOT NULL,
                  productName TEXT NOT NULL,
                  quantity INTEGER NOT NULL,
                  price REAL NOT NULL,
                  imageUrl TEXT,
                  productData TEXT NOT NULL,
                  createdAt TEXT NOT NULL
                );
            `);
            isInitialized = true;
            return database;
        } catch (error) {
            // SQLite connection failed silently
            dbPromise = null;
            return null;
        }
    })();

    return dbPromise;
};

export const init = async () => {
    await getDb();
    // SQLite initialized - no console output in production
};

// ========== SESSION FUNCTIONS ==========

export const insertSession = async ({ localId, email, token }) => {
    try {
        const database = await getDb();
        if (!database) return;
        return await database.runAsync(
            'INSERT OR REPLACE INTO sessions (localId, email, token) VALUES (?, ?, ?);',
            [localId, email, token]
        );
    } catch (e) {
        // Error handled silently
    }
};

export const fetchSession = async () => {
    try {
        const database = await getDb();
        if (!database) return null;
        return await database.getFirstAsync('SELECT * FROM sessions LIMIT 1;');
    } catch (e) {
        return null;
    }
};

export const deleteSession = async () => {
    try {
        const database = await getDb();
        if (!database) return;
        return await database.runAsync('DELETE FROM sessions;');
    } catch (e) {
        // Error handled silently
    }
};

// ========== PENDING CART FUNCTIONS (OFFLINE-FIRST) ==========

export const insertPendingCartItem = async (item) => {
    try {
        const database = await getDb();
        if (!database) return;

        const id = `pending_${item.id}_${Date.now()}`;
        const productData = JSON.stringify(item);
        const createdAt = new Date().toISOString();

        return await database.runAsync(
            `INSERT OR REPLACE INTO pending_cart_items 
             (id, productId, productName, quantity, price, imageUrl, productData, createdAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [id, item.id.toString(), item.title || item.name || '', item.quantity || 1, item.price, item.thumbnail || item.image || '', productData, createdAt]
        );
    } catch (e) {
        // Error handled silently
    }
};

export const updatePendingCartItemQuantity = async (productId, quantity) => {
    try {
        const database = await getDb();
        if (!database) return;

        return await database.runAsync(
            'UPDATE pending_cart_items SET quantity = ? WHERE productId = ?;',
            [quantity, productId.toString()]
        );
    } catch (e) {
        // Error handled silently
    }
};

export const fetchPendingCartItems = async () => {
    try {
        const database = await getDb();
        if (!database) return [];

        const results = await database.getAllAsync('SELECT * FROM pending_cart_items ORDER BY createdAt DESC;');
        return results.map(row => ({
            ...JSON.parse(row.productData),
            pendingId: row.id,
            isPending: true,
            quantity: row.quantity,
        }));
    } catch (e) {
        // Error handled silently
        return [];
    }
};

export const deletePendingCartItem = async (pendingId) => {
    try {
        const database = await getDb();
        if (!database) return;

        return await database.runAsync(
            'DELETE FROM pending_cart_items WHERE id = ?;',
            [pendingId]
        );
    } catch (e) {
        // Error handled silently
    }
};

export const clearPendingCartItems = async () => {
    try {
        const database = await getDb();
        if (!database) return;

        return await database.runAsync('DELETE FROM pending_cart_items;');
    } catch (e) {
        // Error handled silently
    }
};

export const getPendingCartCount = async () => {
    try {
        const database = await getDb();
        if (!database) return 0;

        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM pending_cart_items;');
        return result?.count || 0;
    } catch (e) {
        return 0;
    }
};
