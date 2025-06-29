import { Router } from 'express';
import { profeController } from '../controllers/profesor.controller.js';

const profeRoutes = Router();

//Inscribir Alumnos a las materias
profeRoutes.post('/matricular', profeController.matriAlumno);

//Visualizar alumnos inscriptos en las materias
profeRoutes.get('/alumnos-materia', profeController.AlumnosMateria);

//Crear tarea para los alumnos
profeRoutes.post('/crearTarea', profeController.crearTarea);

//Visualizar que alumnos entregaron la tarea
profeRoutes.get('/tareasEntregadas', profeController.tareasEntregadas)

export default profeRoutes;