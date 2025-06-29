import { request, response } from "express";
import {getConnection} from '../database/database.js'




const matriAlumno = async (req = request, res = response) => {
    const connection = await getConnection();
    const { profesorID, alumnoID, materiaID } = req.body;


    if(!profesorID || !alumnoID || !materiaID) {
        console.log('Faltan campos para completar', {profesorID, alumnoID, materiaID})
        return res.status(400).json({
            ok: false,
            msj: "Completar todos los campos"
        });
    }

    try {
        //verificar que el id ingresado corresponda al profesor y no a un alumno
        const [profesor] = await connection.query(
            'SELECT rol FROM Usuario WHERE usuarioID = ?',
            [profesorID]
        );

        if (profesor.length === 0 || profesor[0].rol !== 'Profesor'){
            return res.status(403).json({
                ok: false,
                msj: 'El usuario no es valido para matricular a un alumno'
            });
        }

        //Verificar que el profesor sea el titular de la materia
        const [matAsig] = await connection.query (
            'SELECT materiaID FROM Materia WHERE materiaID = ? and usuarioID = ?',
            [materiaID, profesorID]
        );

        if (matAsig.length === 0) {
            return res.status(403).json({
                ok: false,
                msj:'El profesor no puede matricular esta materia porque no es el titular de la misma'
            })
        }

        //verificar que el alumno no esté matriculado en la materia
        const [exisAlum] = await connection.query(
            'SELECT matriculaID FROM Matricula WHERE usuarioID = ? AND materiaID = ?',
            [alumnoID, materiaID] 
        );
    
    if (exisAlum.length > 0) {
        return res.status(409).json({
            ok: false,
            msj:'El alumno ya se encuentra inscripto en la materia'
        });
    }
    //anotar al alumno en la materia y mensaje de inscripción exitosa
    const [result] = await connection.query(
        'INSERT INTO Matricula (usuarioID, materiaID) VALUES (?, ?)',
        [alumnoID, materiaID]
    );

    res.status(201).json({
        ok: true,
        matriculaID: result.insertId,
        msj: 'Alumno inscripto exitosamente'
    })

} catch(error){
    console.error("Error al inscribir al alumno", error);
    res.status (500).json({
        ok: false,
        msj:'Error interno del servidor'
    });
}
};

//Ver lista de alumnos inscriptos en la materia
const AlumnosMateria = async (req = request,res = response) => {
    const connection = await getConnection();
    const profesorID = parseInt(req.query.profesorID);
    const materiaID = parseInt(req.query.materiaID);
    
    //Validar campos en la solicitud
    if (isNaN(profesorID) || isNaN(materiaID)) {
        return res.status(400).json({
            ok: false,
            msj: 'profesorID y materiaID son obligatorios'
        });
    }

    try{
        //verificar que el ID del usuario pertenezca al profesor
        const [profesorData] = await connection.query(
        'SELECT rol FROM Usuario WHERE usuarioID = ?',
        [profesorID]
        );

        if (profesorData.length === 0 || profesorData [0].rol !== 'Profesor'){
            return res.status(403).json({
                ok: false,
                msj: 'El usuario solicitado no es un profesor válido o no tiene permiso para ver esta información.'
            });
        }
        //Vericar que el profesor sea el titular de la materia
        const [materiaAsignacion] = await connection.query(
            'SELECT materiaID FROM Materia WHERE materiaID = ? and usuarioID = ?',
            [materiaID, profesorID]
        );

        if (materiaAsignacion.length === 0) {
            return res.status(403).json({
                ok: false,
                msj: 'El profesor no es el titular de esta materia'
            });
        }

        //Ver la lista de alumnos inscriptos a la materia 
        const [alumnosMateria] = await connection.query(
            `SELECT U.usuarioID, U.nombre, U.email, U.rol
            FROM Matricula M
            JOIN Usuario U ON M.usuarioID = U.usuarioID
            WHERE M.materiaID = ? AND U.rol = 'alumno'`,
            [materiaID]
        );
        
        
       return res.status(200).json({
            ok: true,
            totalAlumnos: alumnosMateria.length,
            alumnos: alumnosMateria,
            msj: 'Alumnos de la materia obtenidos exitosamente.'
        });

    } catch (error) {
        console.error ("Error al obtener alumnos por materia: ", error);
        return res.status(500).json({
            ok: false,
            msj: 'Error interno del servidor al intentar obtener los alumnos'
        });
    }
    
};

const crearTarea = async (req = request, res = response) => {
    const connection = await getConnection ();
    const {profesorID, materiaID, titulo, descripcion, fechEntrega} = req.body;

    if(!profesorID || !materiaID || !titulo || !fechEntrega){
        return res.status(400).json({
            ok: false,
            msj: 'Completar los campos obligatorios'
        });
    }

    try{
        const [profesorData] = await connection.query(
            'SELECT rol FROM Usuario WHERE usuarioID = ?',
            [profesorID]
        );
        
        if (profesorData.length === 0 || profesorData[0].rol !== 'Profesor'){
            return res.status (403).json({
                ok: false,
                msj: 'El usuario no pertenece a un profesor para poder crear una tarea'
            });
        }

        const [matAsignada] = await connection.query(
            'SELECT materiaID FROM Materia WHERE materiaID = ? AND usuarioID = ?',
            [materiaID, profesorID]
        );
        if(matAsignada.length === 0){
            return res.status(403).json ({
                ok: false,
                msj:'El profesor no es el titular de la materia'
            });
        }

        const [result] = await connection.query(
            'INSERT INTO Tarea (titulo, descripcion, fechEntrega, usuarioID, materiaID) VALUES (?, ?, ?, ?, ?)',
            [titulo, descripcion, fechEntrega, profesorID, materiaID]
        );

        res.status(201).json({
            ok: true,
            tareaID: result.insertId,
            msj: 'La tarea se creo de manera exitosa'
        });
    } catch (error){
        console.error("Error al querer crear la tarea:", error);
        res.status(500).json({
            ok: false,
            msj: 'Error interno del servidor al intentar crear la tarea'
        });
    }
};


const tareasEntregadas = async (req= request, res=response) =>{
    const connection = await getConnection();
    const profesorID = parseInt(req.query.profesorID);
    const tareaID = parseInt(req.query.tareaID);

    if (isNaN(profesorID) || isNaN(tareaID)){
        return res.status(400).json({
            ok: false,
            msj:'Es necesarion completar los campos obligatorios'
        });
    }

    try{
        const [profesorData] = await connection.query(
            'SELECT rol FROM Usuario WHERE usuarioID = ?',
            [profesorID]
        );
        if(profesorData.length === 0 || profesorData[0].rol !== 'Profesor') {
            return res.status(403).json({
                ok: false,
                msj: 'El usuario con el que se quiere hacer la consulta no es un profesor o no tiene permiso'
            });
        }

        const [tareaData] = await connection.query(
            'SELECT materiaID, usuarioID FROM Tarea WHERE tareaID = ?',
            [tareaID]
        );
        if (tareaData.length === 0) {
            return res.status(404).json({
                ok:false,
                msj: 'La tarea que estás buscando no existe'
            });
        }

        const matTarea = tareaData[0].materiaID;
        const profTarea = tareaData[0].usuarioID;

        if(profTarea !== profesorID){
            return res.status(403).json({
                ok: false,
                msj: 'Este profesor no es el titular de la materia y no puede ver las tareas entregadas'
            });
        }

        const [entregas] = await connection.query(
            `SELECT E.entregaID, E.linkEntrega, E.calificacion, E.estadoEntrega, E.fechaEntrega,
                U.usuarioID AS alumnoID, U.nombre AS nombreAlumno, U.email AS emailAlumno
            FROM Entrega E
            JOIN Usuario U ON E.alumnoID = U.usuarioID
            WHERE E.tareaID = ?`,
            [tareaID]
        );
        
        res.status(200).json({
            ok: true,
            totalEntregas: entregas.length,
            entregas: entregas,
            msj: 'Entregas de la tarea obtenidas exitosamente'
        });
    } catch (error){
        console.error("Error al obtener entregas por tarea", error);
        res.status(500).json({
            ok: false,
            msj:'Error interno del servidor al intentar obtener las entregas'
        });
    }
};

//Exportar funciones

export const profeController = {matriAlumno, AlumnosMateria, crearTarea, tareasEntregadas};