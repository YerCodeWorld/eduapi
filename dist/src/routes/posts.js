"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = void 0;
const express_1 = require("express");
const posts_1 = require("../controllers/posts");
const router = (0, express_1.Router)();
exports.postRoutes = router;
// Discrepancy on find method (slug/id) should be changed after determined what approach works best
router.post('/', posts_1.postsController.createPost);
router.get('/', posts_1.postsController.getAllPosts);
router.get('user/:email', posts_1.postsController.getPostByEmail);
router.get('/slug/:slug', posts_1.postsController.getPostsBySlug);
router.put('/:id', posts_1.postsController.updatePost);
router.delete('/:slug', posts_1.postsController.deletePost);
//# sourceMappingURL=posts.js.map