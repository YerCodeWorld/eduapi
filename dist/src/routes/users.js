"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const users_1 = require("../controllers/users");
const router = (0, express_1.Router)();
exports.userRoutes = router;
router.get('/', users_1.userController.getAllUsers);
router.get('/email/:email', users_1.userController.getUserById);
router.put('/email/:email', users_1.userController.updateUser);
router.post('/', users_1.userController.createUser);
//# sourceMappingURL=users.js.map