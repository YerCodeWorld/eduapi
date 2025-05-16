import { Router } from 'express';
import { postsController } from "../controllers/posts";

const router: Router = Router();

// Discrepancy on find method (slug/id) should be changed after determined what approach works best

router.post('/', postsController.createPost);
router.get('/', postsController.getAllPosts);
router.get('/user/:email', postsController.getPostByEmail);
router.get('/slug/:slug', postsController.getPostsBySlug);
router.put('/:slug', postsController.updatePost);
router.delete('/:slug', postsController.deletePost);

export { router as postRoutes };