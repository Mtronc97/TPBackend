import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';

const adminRoutes = Router();

adminRoutes.post('/', adminController.create);

export default adminRoutes;