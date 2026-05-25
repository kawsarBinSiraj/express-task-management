"use strict";
/**
 * File: src/routes/task.route.ts
 * Purpose: Task CRUD routes with role-based access.
 */
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
const taskController = __importStar(require("../controllers/task.controller"));
const validateRequest_1 = require("../middlewares/validateRequest");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const task_validation_1 = require("../validations/task.validation");
const prisma_1 = require("../generated/prisma");
const router = (0, express_1.Router)();
/* All task routes require authentication. */
router.use(auth_middleware_1.authenticate);
/* GET /tasks/members — all authenticated users can fetch member list for the assign dropdown */
router.get('/members', taskController.getMembers);
/* GET /tasks — admin sees all, member sees only assigned */
router.get('/', taskController.getTasks);
/* GET /tasks/:id — admin or assigned member */
router.get('/:id', taskController.getTaskById);
/* Admin-only mutations */
router.post('/', (0, auth_middleware_1.authorize)(prisma_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(task_validation_1.createTaskSchema), taskController.createTask);
router.put('/:id', (0, auth_middleware_1.authorize)(prisma_1.Role.ADMIN), (0, validateRequest_1.validateRequest)(task_validation_1.updateTaskSchema), taskController.updateTask);
router.delete('/:id', (0, auth_middleware_1.authorize)(prisma_1.Role.ADMIN), taskController.deleteTask);
exports.default = router;
//# sourceMappingURL=task.route.js.map