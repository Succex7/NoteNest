// ============================================================
// utils/asyncHandler.js — Async error wrapper
// Wraps async route handlers to forward errors to Express
// ============================================================

/**
 * Wraps an async function and catches any rejected promise,
 * passing the error to Express's next() error handler.
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - Async controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;