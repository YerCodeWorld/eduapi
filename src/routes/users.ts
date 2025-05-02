import { Router } from "express";
import { userController } from "../controllers/users";

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/email/:email', userController.getUserById);
router.put('/email/:email', userController.updateUser);
router.post('/', userController.createUser);


// .put | /:id | updateUser
// .delete | /:id | deleteUser

export { router as userRoutes };