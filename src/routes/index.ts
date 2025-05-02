import { Router } from 'express';
import { userRoutes } from "./users";
import { testimonyRoutes } from "./testimonies";

const router = Router();

router.use('/users', userRoutes);
router.use('/testimonies', testimonyRoutes);

export { router as routes };