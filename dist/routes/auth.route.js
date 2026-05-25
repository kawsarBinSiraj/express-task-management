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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const validateRequest_1 = require("../middlewares/validateRequest");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_validation_1 = require("../validations/auth.validation");
const router = (0, express_1.Router)();
/* Signup route: validate signup schema then create the user and return a JWT. */
router.post('/signup', (0, validateRequest_1.validateRequest)(auth_validation_1.signupSchema), authController.signup);
/* Signin route: validate signin data then authenticate and return JWT. */
router.post('/signin', (0, validateRequest_1.validateRequest)(auth_validation_1.signinSchema), authController.signin);
/* Logout route: requires a valid JWT; client is responsible for discarding it. */
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
/* Protected /me route: authenticate JWT and return current user payload. */
router.get('/me', auth_middleware_1.authenticate, authController.getMe);
/* Update profile: update name and/or email of the authenticated user. */
router.patch('/me', auth_middleware_1.authenticate, (0, validateRequest_1.validateRequest)(auth_validation_1.updateProfileSchema), authController.updateProfile);
/* Change password: verify current password then set a new one. */
router.patch('/me/password', auth_middleware_1.authenticate, (0, validateRequest_1.validateRequest)(auth_validation_1.changePasswordSchema), authController.changePassword);
/* Forgot password: send a reset link to the provided email. */
router.post('/forgot-password', (0, validateRequest_1.validateRequest)(auth_validation_1.forgotPasswordSchema), authController.forgotPassword);
/* Reset password: validate token and set new password. */
router.post('/reset-password', (0, validateRequest_1.validateRequest)(auth_validation_1.resetPasswordSchema), authController.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.route.js.map