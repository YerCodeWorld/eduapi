import { Router } from 'express';
import { userRoutes } from "./users";
import { testimonyRoutes } from "./testimonies";
import { postRoutes } from "./posts";

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/testimonies', testimonyRoutes);
router.use('/posts', postRoutes);

export { router as routes };