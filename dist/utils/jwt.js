"use strict";
/**
 * File: src/utils/jwt.ts
 * Purpose: Sign and verify JWTs with centralized config and typed payloads.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
/* Sign a JWT for the given payload using config-defined secret and expiry. */
const signToken = (payload) => {
    const options = {
        /*
         * Token expiry e.g. '7d', '2h', '30m'.
         * Read from the JWT_EXPIRES_IN environment variable.
         * Short-lived tokens (≤ 1h) combined with refresh tokens
         * are recommended for high-security applications.
         */
        expiresIn: config_1.default.jwt.expiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwt.secret, options);
};
exports.signToken = signToken;
/* Verify a JWT and return the decoded IJwtPayload, throwing on invalid or expired tokens. */
const verifyToken = (token) => {
    /*
     * `jwt.verify` returns `string | JwtPayload`.
     * We intersect with IJwtPayload to narrow the type since we know our
     * tokens always contain id, email, and role in the payload.
     */
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
    return decoded;
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map