import { Router } from 'express';
import { alumnoController } from '../controllers/alumno.controller.js';

const alumnoRoutes = Router();

alumnoRoutes.get('/alumTarea', alumnoController.AlumTarea);
alumnoRoutes.post('/entreTarea', alumnoController.entreTarea);

export default alumnoRoutes;