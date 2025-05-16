"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const users_1 = require("./users");
const testimonies_1 = require("./testimonies");
const posts_1 = require("./posts");
const router = (0, express_1.Router)();
exports.routes = router;
router.use('/users', users_1.userRoutes);
router.use('/testimonies', testimonies_1.testimonyRoutes);
router.use('/posts', posts_1.postRoutes);
//# sourceMappingURL=index.js.map