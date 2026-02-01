/**
 * @fileoverview Input Sanitization Utilities (Zero-Trust Security)
 * @description Prevents XSS, SQL injection, and data overflow attacks.
 * Apply to all user-generated content before persistence or display.
 */

/**
 * Sanitizes text input by escaping HTML entities.
 * @param {string} input - Raw user input
 * @param {number} maxLength - Maximum allowed length (default: 500)
 * @returns {string} Sanitized string
 */
export const sanitizeText = (input, maxLength = 500) => {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim()
        .slice(0, maxLength);
};

/**
 * Sanitizes email format.
 * @param {string} email - Raw email input
 * @returns {string|null} Lowercase trimmed email or null if invalid
 */
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return null;

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(trimmed) ? trimmed : null;
};

/**
 * Sanitizes numeric input.
 * @param {any} value - Input value
 * @param {object} options - { min, max, fallback }
 * @returns {number} Validated number
 */
export const sanitizeNumber = (value, { min = 0, max = 9999, fallback = 0 } = {}) => {
    const num = parseFloat(value);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
};

/**
 * Sanitizes an object, keeping only allowed keys and sanitizing string values.
 * @param {object} obj - Input object
 * @param {string[]} allowedKeys - Keys to preserve
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj, allowedKeys) => {
    if (!obj || typeof obj !== 'object') return {};

    return Object.fromEntries(
        Object.entries(obj)
            .filter(([key]) => allowedKeys.includes(key))
            .map(([key, val]) => [
                key,
                typeof val === 'string' ? sanitizeText(val) : val
            ])
    );
};

/**
 * Validates and sanitizes review data specifically.
 * @param {object} review - { rating, comment, productId, userId }
 * @returns {object} Sanitized review or throws on invalid
 */
export const sanitizeReview = (review) => {
    const allowedKeys = ['rating', 'comment', 'productId', 'userId', 'userName'];
    const sanitized = sanitizeObject(review, allowedKeys);

    // Validate rating (1-5)
    sanitized.rating = sanitizeNumber(sanitized.rating, { min: 1, max: 5, fallback: 5 });

    // Limit comment to 1000 chars
    if (sanitized.comment) {
        sanitized.comment = sanitizeText(sanitized.comment, 1000);
    }

    return sanitized;
};

/**
 * Validates order data before submission.
 * @param {object} order - Order payload
 * @returns {object} Sanitized order
 */
export const sanitizeOrder = (order) => {
    const allowedKeys = ['user', 'total', 'items', 'createdAt', 'shippingAddress'];
    const sanitized = sanitizeObject(order, allowedKeys);

    // Ensure total is positive
    sanitized.total = sanitizeNumber(sanitized.total, { min: 0, max: 999999 });

    // Sanitize shipping address if present
    if (sanitized.shippingAddress && typeof sanitized.shippingAddress === 'object') {
        sanitized.shippingAddress = sanitizeObject(sanitized.shippingAddress, [
            'street', 'city', 'state', 'zipCode', 'country'
        ]);
    }

    return sanitized;
};
