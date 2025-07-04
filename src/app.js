import express from 'express';
import { envs } from "./configuration/envs.js";
import adminRoutes from './routes/admin.routes.js';
import profeRoutes from './routes/profesor.routes.js';
import alumnoRoutes from './routes/alumno.routes.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Bienvenido a nuestro servidor!")
});

app.use('/admin', adminRoutes);

app.use('/profesor', profeRoutes);

app.use('/alumno', alumnoRoutes);

app.set('port', envs.PORT);

export default app;