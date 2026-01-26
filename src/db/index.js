/**
 * @fileoverview SQLite Database Layer for Offline Persistence
 * @description Manages local session storage and pending cart items for offline-first functionality.
 * Uses WAL mode for concurrent reads and write-ahead logging.
 */
import * as SQLite from 'expo-sqlite';

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
                  token TEXT NOT NULL,
                  profileImage TEXT,
                  userLocation TEXT,
                  themePreference TEXT DEFAULT 'light'
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

            // Migration: Add new columns if they don't exist (for existing users)
            try {
                await database.execAsync(`ALTER TABLE sessions ADD COLUMN profileImage TEXT;`);
            } catch (e) { /* Column already exists */ }
            try {
                await database.execAsync(`ALTER TABLE sessions ADD COLUMN userLocation TEXT;`);
            } catch (e) { /* Column already exists */ }
            try {
                await database.execAsync(`ALTER TABLE sessions ADD COLUMN themePreference TEXT DEFAULT 'light';`);
            } catch (e) { /* Column already exists */ }
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

/**
 * @description Inserts or replaces a full user session with all persistence fields.
 * @context Layer: Data/Persistence - SQLite session storage
 * @param {Object} session - Session data object
 * @param {string} session.localId - Firebase UID
 * @param {string} session.email - User email
 * @param {string} session.token - Auth token
 * @param {string|null} session.profileImage - Profile picture URI
 * @param {Object|null} session.userLocation - Location object {coords, address}
 * @param {string} session.themePreference - 'light' or 'dark'
 */
export const insertSession = async ({ localId, email, token, profileImage = null, userLocation = null, themePreference = 'light' }) => {
    try {
        const database = await getDb();
        if (!database) return;
        const locationJson = userLocation ? JSON.stringify(userLocation) : null;
        return await database.runAsync(
            'INSERT OR REPLACE INTO sessions (localId, email, token, profileImage, userLocation, themePreference) VALUES (?, ?, ?, ?, ?, ?);',
            [localId, email, token, profileImage, locationJson, themePreference]
        );
    } catch (e) {
        // Error handled silently
    }
};

/**
 * @description Fetches the stored session with all user preferences.
 * @returns {Promise<Object|null>} Session object with parsed userLocation
 */
export const fetchSession = async () => {
    try {
        const database = await getDb();
        if (!database) return null;
        const session = await database.getFirstAsync('SELECT * FROM sessions LIMIT 1;');
        if (session && session.userLocation) {
            try {
                session.userLocation = JSON.parse(session.userLocation);
            } catch (e) {
                session.userLocation = null;
            }
        }
        return session;
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

/**
 * @description Updates specific fields in the current session without replacing all data.
 * @param {Object} updates - Fields to update (profileImage, userLocation, themePreference)
 */
export const updateSession = async (updates) => {
    try {
        const database = await getDb();
        if (!database) return;

        const session = await fetchSession();
        if (!session) return;

        const { profileImage, userLocation, themePreference } = updates;
        const setClauses = [];
        const values = [];

        if (profileImage !== undefined) {
            setClauses.push('profileImage = ?');
            values.push(profileImage);
        }
        if (userLocation !== undefined) {
            setClauses.push('userLocation = ?');
            values.push(userLocation ? JSON.stringify(userLocation) : null);
        }
        if (themePreference !== undefined) {
            setClauses.push('themePreference = ?');
            values.push(themePreference);
        }

        if (setClauses.length === 0) return;

        values.push(session.localId);
        return await database.runAsync(
            `UPDATE sessions SET ${setClauses.join(', ')} WHERE localId = ?;`,
            values
        );
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
