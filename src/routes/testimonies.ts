import { Router } from "express";
import { testimonyController } from '../controllers/testimonies';

const router = Router();

router.get('/', testimonyController.getAllTestimonies);

router.get('/featured', testimonyController.getFeaturedTestimonies);

router.get('/user/:email', testimonyController.getTestimonyByEmail);

router.post('/', testimonyController.createTestimony);

// PUT - UPDATE TESTIMONY

// DELETE - DELETE TESTIMONY

export { router as testimonyRoutes };