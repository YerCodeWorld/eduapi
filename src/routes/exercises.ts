import { Router } from 'express';
import { exercisesController } from '../controllers/exercises';

const router: Router = Router();

// GET routes
router.get('/', exercisesController.getAllExercises);
router.get('/:id', exercisesController.getExercise);
router.get('/author/:email', exercisesController.getExercisesByAuthor);

// POST routes
router.post('/', exercisesController.createExercise);
router.post('/bulk', exercisesController.createExercisesBulk);
router.post('/:id/complete', exercisesController.incrementCompletions);

// PUT routes
router.put('/:id', exercisesController.updateExercise);

// DELETE routes
router.delete('/:id', exercisesController.deleteExercise);

export { router as exerciseRoutes };