"use strict";
/**
 * File: src/services/auth.service.ts
 * Purpose: Auth business logic for signup and signin, separated from HTTP handlers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.changePassword = exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
const config_1 = __importDefault(require("../config"));
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const error_middleware_1 = require("../middlewares/error.middleware");
/* Signup service: create user, hash password, sign JWT, and return payload. */
const signup = async (data) => {
    const { name, email, password } = data;
    /* Fail fast if the email already exists before hashing password. */
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new error_middleware_1.AppError('An account with this email already exists.', 409);
    }
    /* Hash the password using bcrypt with configured salt rounds. */
    const hashedPassword = await bcryptjs_1.default.hash(password, config_1.default.bcrypt.saltRounds);
    /* Create the user and select only safe return fields. */
    const user = await prisma_1.default.user.create({
        data: { name, email, password: hashedPassword },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    /* Build the sanitized user payload for the response. */
    const userPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    /* Sign a JWT for the new user. */
    const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
    return { user: userPayload, token };
};
exports.signup = signup;
/* forgotPassword service: generate a reset token, persist it, and send the email. */
const forgotPassword = async (email) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    /* Always resolve successfully to prevent email enumeration. */
    if (!user)
        return;
    /* Invalidate any existing unused tokens for this user. */
    await prisma_1.default.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
    });
    /* Generate a secure random token and store its SHA-256 hash. */
    const rawToken = crypto_1.default.randomBytes(32).toString('hex');
    const hashedToken = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + config_1.default.email.resetTokenTtlMs);
    await prisma_1.default.passwordResetToken.create({
        data: { userId: user.id, token: hashedToken, expiresAt },
    });
    const resetUrl = `${config_1.default.client.url}/reset?token=${rawToken}`;
    await (0, mailer_1.sendPasswordResetEmail)(user.email, resetUrl);
};
exports.forgotPassword = forgotPassword;
/* resetPassword service: validate the token and set the new password. */
const resetPassword = async (rawToken, newPassword) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(rawToken).digest('hex');
    const record = await prisma_1.default.passwordResetToken.findUnique({ where: { token: hashedToken } });
    if (!record || record.used || record.expiresAt < new Date()) {
        throw new error_middleware_1.AppError('Reset link is invalid or has expired.', 400);
    }
    const hashed = await bcryptjs_1.default.hash(newPassword, config_1.default.bcrypt.saltRounds);
    await prisma_1.default.$transaction([
        prisma_1.default.user.update({ where: { id: record.userId }, data: { password: hashed } }),
        prisma_1.default.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);
};
exports.resetPassword = resetPassword;
/* updateProfile service: update the authenticated user's name and/or email. */
const updateProfile = async (userId, data) => {
    if (data.email) {
        const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existing && existing.id !== userId) {
            throw new error_middleware_1.AppError('An account with this email already exists.', 409);
        }
    }
    const user = await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.email ? { email: data.email.toLowerCase() } : {}),
        },
        select: { id: true, name: true, email: true, role: true },
    });
    return user;
};
exports.updateProfile = updateProfile;
/* changePassword service: verify current password then set a new one. */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new error_middleware_1.AppError('User not found.', 404);
    const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!isValid)
        throw new error_middleware_1.AppError('Current password is incorrect.', 400);
    const hashed = await bcryptjs_1.default.hash(newPassword, config_1.default.bcrypt.saltRounds);
    await prisma_1.default.user.update({ where: { id: userId }, data: { password: hashed } });
};
exports.changePassword = changePassword;
/* Signin service: verify credentials and return user payload plus JWT. */
const signin = async (data) => {
    const { email, password } = data;
    /* Retrieve the user by email, including hash for password check. */
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        /* Generic 401 for missing user to prevent enumeration. */
        throw new error_middleware_1.AppError('Invalid email or password.', 401);
    }
    /* Compare the submitted password with the stored bcrypt hash. */
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new error_middleware_1.AppError('Invalid email or password.', 401);
    }
    /* Prepare the safe response payload without password data. */
    const userPayload = { ...user };
    const token = (0, jwt_1.signToken)(userPayload);
    return { user: userPayload, token };
};
exports.signin = signin;
//# sourceMappingURL=auth.service.js.map