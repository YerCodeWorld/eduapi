import { Router } from 'express';
import { postsController } from "../controllers/posts";

const router: Router = Router();

router.post('/', postsController.createPost);
router.get('/', postsController.getAllPosts);

export { router as postRoutes };