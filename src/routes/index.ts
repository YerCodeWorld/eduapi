// src/routes/index.ts - Add images route
import { Router } from 'express';
import { userRoutes } from "./users";
import { testimonyRoutes } from "./testimonies";
import { postRoutes } from "./posts";
import { imageRoutes } from "./cloudinary";

const router: Router = Router();

router.use('/users', userRoutes);
router.use('/testimonies', testimonyRoutes);
router.use('/posts', postRoutes);
router.use('/images', imageRoutes); //

export { router as routes };