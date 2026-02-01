/**
 * @fileoverview SQLite Database Layer (Sentinel V2.0)
 * @description Central Persistence Unit.
 * Features:
 * - Session Management (Auth)
 * - Offline Cart (Pending Items)
 * - Read-Through Cache (Orders)
 * - Write-Behind Queue (Offline Mutations)
 */
import * as SQLite from 'expo-sqlite';

let isInitialized = false;
let dbPromise = null;

const getDb = async () => {
    if (dbPromise) return dbPromise;

    dbPromise = (async () => {
        try {
            const database = await SQLite.openDatabaseAsync('techzone_sentinel.db');

            // --- SCHEMA DEFINITION (Version 2.0) ---
            await database.execAsync(`
                PRAGMA journal_mode = WAL;
                
                -- 1. User Session (Critical Identity)
                CREATE TABLE IF NOT EXISTS sessions (
                  localId TEXT PRIMARY KEY NOT NULL,
                  email TEXT NOT NULL,
                  token TEXT NOT NULL,
                  profileImage TEXT,
                  userLocation TEXT,
                  themePreference TEXT DEFAULT 'light'
                );

                -- 2. Offline Shopping Cart (Resilient Sales)
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

                -- 3. Cached Orders (Offline Read-Model)
                CREATE TABLE IF NOT EXISTS cached_orders (
                  orderId TEXT PRIMARY KEY NOT NULL,
                  userId TEXT NOT NULL,
                  total REAL NOT NULL,
                  status TEXT NOT NULL,
                  itemsJson TEXT NOT NULL,
                  createdAt TEXT NOT NULL,
                  syncedAt TEXT NOT NULL
                );

                -- 4. Mutation Queue (Offline Write-Model)
                CREATE TABLE IF NOT EXISTS offline_queue (
                    id TEXT PRIMARY KEY NOT NULL,
                    endpoint TEXT NOT NULL,
                    method TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    createdAt TEXT NOT NULL,
                    retryCount INTEGER DEFAULT 0
                );
            `);

            // --- MIGRATIONS (Auto-Healing) ---
            const safeAlter = async (query) => {
                try { await database.execAsync(query); } catch (e) { /* Ignore if column exists */ }
            };

            await safeAlter(`ALTER TABLE sessions ADD COLUMN profileImage TEXT;`);
            await safeAlter(`ALTER TABLE sessions ADD COLUMN userLocation TEXT;`);
            await safeAlter(`ALTER TABLE sessions ADD COLUMN themePreference TEXT DEFAULT 'light';`);

            isInitialized = true;
            return database;
        } catch (error) {
            console.error("Critical DB Failure:", error);
            dbPromise = null;
            return null;
        }
    })();

    return dbPromise;
};

export const init = async () => {
    await getDb();
};

// ========== 1. SESSION DOMAIN ==========

export const insertSession = async ({ localId, email, token, profileImage = null, userLocation = null, themePreference = 'light' }) => {
    try {
        const db = await getDb();
        if (!db) return;
        const locationJson = userLocation ? JSON.stringify(userLocation) : null;
        await db.runAsync(
            'INSERT OR REPLACE INTO sessions (localId, email, token, profileImage, userLocation, themePreference) VALUES (?, ?, ?, ?, ?, ?);',
            [localId, email, token, profileImage, locationJson, themePreference]
        );
    } catch (e) { console.error("Session Write Error", e); }
};

export const fetchSession = async () => {
    try {
        const db = await getDb();
        if (!db) return null;
        const session = await db.getFirstAsync('SELECT * FROM sessions LIMIT 1;');
        if (session?.userLocation) {
            try { session.userLocation = JSON.parse(session.userLocation); } catch { session.userLocation = null; }
        }
        return session;
    } catch { return null; }
};

export const deleteSession = async () => {
    try {
        const db = await getDb();
        if (db) await db.runAsync('DELETE FROM sessions;');
    } catch (e) { /* Silent */ }
};

export const updateSession = async (updates) => {
    try {
        const db = await getDb();
        if (!db) return;
        const session = await fetchSession();
        if (!session) return;

        const { profileImage, userLocation, themePreference } = updates;
        const setClauses = [];
        const values = [];

        if (profileImage !== undefined) { setClauses.push('profileImage = ?'); values.push(profileImage); }
        if (userLocation !== undefined) { setClauses.push('userLocation = ?'); values.push(JSON.stringify(userLocation)); }
        if (themePreference !== undefined) { setClauses.push('themePreference = ?'); values.push(themePreference); }

        if (setClauses.length === 0) return;
        values.push(session.localId);

        await db.runAsync(`UPDATE sessions SET ${setClauses.join(', ')} WHERE localId = ?;`, values);
    } catch (e) { /* Silent */ }
};

// ========== 2. CART DOMAIN (OFFLINE) ==========

export const insertPendingCartItem = async (item) => {
    try {
        const db = await getDb();
        if (!db) return;
        const id = `pending_${item.id}_${Date.now()}`;
        await db.runAsync(
            `INSERT OR REPLACE INTO pending_cart_items (id, productId, productName, quantity, price, imageUrl, productData, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [id, item.id.toString(), item.title || '', item.quantity || 1, item.price, item.thumbnail || '', JSON.stringify(item), new Date().toISOString()]
        );
    } catch (e) { /* Silent */ }
};

export const fetchPendingCartItems = async () => {
    try {
        const db = await getDb();
        if (!db) return [];
        const results = await db.getAllAsync('SELECT * FROM pending_cart_items ORDER BY createdAt DESC;');
        return results.map(row => ({ ...JSON.parse(row.productData), pendingId: row.id, isPending: true, quantity: row.quantity }));
    } catch { return []; }
};

export const clearPendingCartItems = async () => {
    try {
        const db = await getDb();
        if (db) await db.runAsync('DELETE FROM pending_cart_items;');
    } catch { /* Silent */ }
};

// ========== 3. ORDERS DOMAIN (CACHE) ==========

/**
 * @description Bulk upsert orders into local cache for offline viewing.
 */
export const cacheOrders = async (orders, userId) => {
    try {
        const db = await getDb();
        if (!db) return;

        const timestamp = new Date().toISOString();

        // Transactional insert for consistency
        await db.withTransactionAsync(async () => {
            // Optional: Clear old cache for this user to avoid staleness? 
            // Better strategy: Upsert and keep generic.

            for (const order of orders) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO cached_orders (orderId, userId, total, status, itemsJson, createdAt, syncedAt) VALUES (?, ?, ?, ?, ?, ?, ?);`,
                    [
                        order.id,
                        userId,
                        order.total,
                        'delivered', // Simplified for now, backend usually provides this
                        JSON.stringify(order.items),
                        order.createdAt,
                        timestamp
                    ]
                );
            }
        });
    } catch (e) {
        console.error("Cache Orders Failed", e);
    }
};

/**
 * @description Retrieve orders from local cache.
 */
export const getCachedOrders = async (userId) => {
    try {
        const db = await getDb();
        if (!db) return [];
        const results = await db.getAllAsync('SELECT * FROM cached_orders WHERE userId = ? ORDER BY createdAt DESC;', [userId]);

        return results.map(row => ({
            id: row.orderId,
            total: row.total,
            createdAt: row.createdAt,
            items: JSON.parse(row.itemsJson),
            status: row.status,
            isCached: true // UI Flag
        }));
    } catch { return []; }
};

// ========== 4. MUTATION QUEUE (OFFLINE WRITE) ==========

export const enqueueMutation = async (endpoint, method, payload) => {
    try {
        const db = await getDb();
        if (!db) return;
        const id = `mut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.runAsync(
            `INSERT INTO offline_queue (id, endpoint, method, payload, createdAt) VALUES (?, ?, ?, ?, ?);`,
            [id, endpoint, method, JSON.stringify(payload), new Date().toISOString()]
        );
    } catch (e) { /* Silent */ }
};

export const getMutationQueue = async () => {
    try {
        const db = await getDb();
        if (!db) return [];
        return await db.getAllAsync('SELECT * FROM offline_queue ORDER BY createdAt ASC;');
    } catch { return []; }
};

export const removeMutation = async (id) => {
    try {
        const db = await getDb();
        if (db) await db.runAsync('DELETE FROM offline_queue WHERE id = ?;', [id]);
    } catch { /* Silent */ }
};

/**
 * @constant MAX_RETRIES
 * @description Maximum retry attempts before marking a mutation as dead-letter.
 */
export const MAX_RETRIES = 5;

/**
 * @function incrementRetry
 * @description Increments the retry count for a queued mutation.
 * @param {string} id - Mutation ID
 * @returns {Promise<number>} Updated retry count
 */
export const incrementRetry = async (id) => {
    try {
        const db = await getDb();
        if (!db) return MAX_RETRIES; // Force removal if DB unreachable

        await db.runAsync('UPDATE offline_queue SET retryCount = retryCount + 1 WHERE id = ?;', [id]);
        const result = await db.getFirstAsync('SELECT retryCount FROM offline_queue WHERE id = ?;', [id]);
        return result?.retryCount || 0;
    } catch {
        return MAX_RETRIES;
    }
};

/**
 * @function getFailedMutations
 * @description Retrieves mutations that exceeded max retries (dead-letter queue).
 */
export const getFailedMutations = async () => {
    try {
        const db = await getDb();
        if (!db) return [];
        return await db.getAllAsync('SELECT * FROM offline_queue WHERE retryCount >= ?;', [MAX_RETRIES]);
    } catch { return []; }
};
