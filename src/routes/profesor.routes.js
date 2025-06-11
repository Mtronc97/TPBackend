import { Router } from 'express';
import { profeController } from '../controllers/profesor.controller.js';

const profeRoutes = Router();

profeRoutes.post('/matricular', profeController.matriAlumno);

export default profeRoutes;