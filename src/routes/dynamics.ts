import { Router } from 'express';
import { dynamicsController } from "../controllers/dynamics";

const router: Router = Router();

router.post('/', dynamicsController.createDynamic);
router.get('/', dynamicsController.getAllDynamics);
router.get('/user/:email', dynamicsController.getDynamicsByEmail);
router.get('/slug/:slug', dynamicsController.getDynamicBySlug);
router.put('/:slug', dynamicsController.updateDynamic);
router.delete('/:slug', dynamicsController.deleteDynamic);

export { router as dynamicRoutes };