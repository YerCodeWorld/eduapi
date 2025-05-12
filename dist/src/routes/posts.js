"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
const express_1 = require("express");
const posts_1 = require("../controllers/posts");
const router = (0, express_1.Router)();
exports.postRoutes = router;
router.post('/', posts_1.postsController.createPost);
router.get('/', posts_1.postsController.getAllPosts);
//# sourceMappingURL=posts.js.map