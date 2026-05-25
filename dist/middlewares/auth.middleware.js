"use strict";
/**
 * File: src/middlewares/auth.middleware.ts
 * Purpose: Authenticate JWTs and provide optional role-based authorization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
/* Authenticate the Bearer JWT and attach decoded payload to req.user. */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    /* Reject requests missing a valid Bearer Authorization header. */
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, response_1.sendError)(res, 401, 'Authentication required. Please provide a valid Bearer token.');
        return;
    }
    /* Extract the token string from the Bearer header. */
    const token = authHeader.split(' ')[1];
    try {
        /* Verify the token and attach decoded payload to req.user. */
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch {
        /* Return a generic 401 for invalid or expired tokens. */
        (0, response_1.sendError)(res, 401, 'Invalid or expired token. Please sign in again.');
    }
};
exports.authenticate = authenticate;
/* authorize: Role-based middleware factory returning 403 if role is not allowed. */
const authorize = (...roles) => {
    return (req, res, next) => {
        /* Deny access when the user is missing or role is not allowed. */
        if (!req.user || !roles.includes(req.user.role)) {
            (0, response_1.sendError)(res, 403, `Access forbidden. Required role(s): ${roles.join(', ')}.`);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map