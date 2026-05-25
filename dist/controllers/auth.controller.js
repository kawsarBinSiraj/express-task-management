"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.getMe = exports.logout = exports.signin = exports.signup = void 0;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
/* Signup handler: create a new account and return token data. */
exports.signup = (0, catchAsync_1.default)(async (req, res) => {
    /* req.body is validated upstream, so this assertion is safe. */
    const input = req.body;
    const result = await authService.signup(input);
    (0, response_1.sendSuccess)(res, 201, 'Account created successfully.', result);
});
/* Signin handler: authenticate user and return token data. */
exports.signin = (0, catchAsync_1.default)(async (req, res) => {
    const input = req.body;
    const result = await authService.signin(input);
    (0, response_1.sendSuccess)(res, 200, 'Signed in successfully.', result);
});
/* Logout handler: stateless logout — client must discard the JWT. */
exports.logout = (0, catchAsync_1.default)(async (_req, res) => {
    (0, response_1.sendSuccess)(res, 200, 'Signed out successfully.', null);
});
/* getMe handler: return the authenticated user's decoded token payload. */
exports.getMe = (0, catchAsync_1.default)(async (req, res) => {
    /* req.user is set by authenticate middleware before this handler. */
    (0, response_1.sendSuccess)(res, 200, 'User profile retrieved successfully.', {
        user: req.user,
    });
});
/* updateProfile handler: update the authenticated user's name and/or email. */
exports.updateProfile = (0, catchAsync_1.default)(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);
    (0, response_1.sendSuccess)(res, 200, 'Profile updated successfully.', { user });
});
/* changePassword handler: verify current password then set a new one. */
exports.changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    (0, response_1.sendSuccess)(res, 200, 'Password changed successfully.', null);
});
/* forgotPassword handler: send a reset email (always 200 to prevent enumeration). */
exports.forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    (0, response_1.sendSuccess)(res, 200, 'If that email exists, a reset link has been sent.', null);
});
/* resetPassword handler: validate token and set new password. */
exports.resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    (0, response_1.sendSuccess)(res, 200, 'Password reset successfully.', null);
});
//# sourceMappingURL=auth.controller.js.map