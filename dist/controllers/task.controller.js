"use strict";
/**
 * File: src/controllers/task.controller.ts
 * Purpose: HTTP handlers for task endpoints.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembers = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const taskService = __importStar(require("../services/task.service"));
const response_1 = require("../utils/response");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.getTasks = (0, catchAsync_1.default)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await taskService.getTasks(req.user.id, req.user.role, page, limit);
    (0, response_1.sendSuccess)(res, 200, 'Tasks retrieved successfully.', result);
});
exports.getTaskById = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.params.id;
    const task = await taskService.getTaskById(id, req.user.id, req.user.role);
    (0, response_1.sendSuccess)(res, 200, 'Task retrieved successfully.', { task });
});
exports.createTask = (0, catchAsync_1.default)(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user.id);
    (0, response_1.sendSuccess)(res, 201, 'Task created successfully.', { task });
});
exports.updateTask = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.params.id;
    const task = await taskService.updateTask(id, req.body);
    (0, response_1.sendSuccess)(res, 200, 'Task updated successfully.', { task });
});
exports.deleteTask = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.params.id;
    await taskService.deleteTask(id);
    (0, response_1.sendSuccess)(res, 200, 'Task deleted successfully.', null);
});
exports.getMembers = (0, catchAsync_1.default)(async (_req, res) => {
    const members = await taskService.getMembers();
    (0, response_1.sendSuccess)(res, 200, 'Members retrieved successfully.', { members });
});
//# sourceMappingURL=task.controller.js.map