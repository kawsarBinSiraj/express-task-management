"use strict";
/**
 * File: src/middlewares/validateRequest.ts
 * Purpose: Create a Zod-based middleware to validate and sanitize req.body.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const response_1 = require("../utils/response");
/* Create a middleware from a Zod schema that validates req.body. */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            /* Convert Zod issues into a simple array of field/message objects. */
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            (0, response_1.sendError)(res, 422, 'Validation failed', errors);
            return;
        }
        /* Replace req.body with the validated, normalized value from Zod. */
        req.body = result.data;
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map