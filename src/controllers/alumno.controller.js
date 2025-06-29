import { request, response } from "express";
import {getConnection} from '../database/database.js'

const AlumTarea = async (req=request, res=response) =>{
    const connection = await getConnection();

    const alumnoID = parseInt(req.query.alumnoID);
    const materiaID = parseInt(req.query.materiaID);

    if(isNaN(alumnoID) || isNaN(materiaID)){
        return res.status(400).json({
            ok: false,
            msj: 'Faltan campos obligatorios a completar'
        });
    }


    try{
        const[alumnoData] = await connection.query(
            'SELECT rol FROM Usuario WHERE usuarioID = ?',
            [alumnoID]
        );
        if (alumnoData.length === 0 || alumnoData[0].rol !== 'alumno'){
            return res.status(403).json({
                ok: false,
                msj: 'El usuario no es un alumno registrado'
            });
        }

        const [matriculaOK] = await connection.query(
            'SELECT matriculaID FROM Matricula WHERE usuarioID = ? AND materiaID = ?',
            [alumnoID, materiaID]
        );
        if(matriculaOK.length === 0){
            return res.status(403).json({
                ok: false,
                msj: 'El alumno no está inscripto en esta materia'
            });
        }

        const [tarea] = await connection.query(
            `SELECT tareaID, titulo, descripcion, fechEntrega, U.nombreProfesor
            FROM Tarea T
            JOIN Usuario U ON T.usuarioID = U.usuarioID
            WHERE T.materiaID = ?`,
            [materiaID]
        );

        res.status(200).json({
            ok: true,
            totalTareas: tareas.length,
            tareas: tareas,
            msj: 'Lista de tareas obtenida de manera exitosa'
        });
    }catch (error){
        console.error("Error al querer obtener las tarea del alumno", error);
        res.status(500).json({
            ok: false,
            msj: 'Error interno del servidor al intentar obtener las tareas'
        });
    }

};


const entreTarea = async (req = request, res = response) =>{
    const connection = await getConnection();
    const {alumnoID, tareaID, linkEntrega} = req.body;

    if (!alumnoID || !tareaID || !linkEntrega){
        return res.status(400).json({
            ok: false,
            msj: 'Todos los campos son obligatorios'
        });
    }

    try{
        const [alumnoData] = await connection.query(
            'SELECT rol FROM Usuario WHERE usuarioID = ?',
            [alumnoID]
        );
        if (alumnoData.length === 0 || alumnoData[0].rol !== 'alumno'){
            return res.status (403).json({
                ok: false,
                msj: 'El usuario que intenta entregar la tarea no es un alumno'
            });
        }

        const [tareaData] = await connection.query(
            'SELECT materiaID FROM Tarea WHERE tareaID = ?',
            [tareaID]
        );
        if (tareaData.length === 0) {
            return res.status(404).json({
                ok: false,
                msj: 'La tarea especificada no existe'
            });
        }
        
        const tareMateria = tareaData[0].materiaID;

        const [matriculaOK] = await connection.query(
            'SELECT matriculaID FROM Matricula WHERE usuarioID = ? AND materiaID = ?',
            [alumnoID, tareMateria]
        );
        if (matriculaOK.length === 0) {
            return res.status(403).json({
                ok: false,
                msj: 'El alumno no est+a inscripto en la materia'
            });
        }

        const [existingEntrega] = await connection.query(
            'SELECT entregaID FROM Entrega WHERE tareaID = ? AND alumnoID = ?',
            [tareaID, alumnoID]
        );

        let result;
        if (existingEntrega.length > 0) {
            result = await connection.query(
                'UPDATE Entrega SET linkEntrega = ?, estadoEntrega = ?, fechaEntrega = CURRENT_TIMESTAMP WHERE tareaID = ? AND alumnoID = ?',
                [linkEntrega, 'Entregado', tareaID, alumnoID]
            );
            res.status(200).json({
                ok: true,
                entregaID: existingEntrega[0].entregaID,
                msj: 'Entrega de tarea actualizada exitosamente'
            });
        }else{
            result = await connection.query(
                'INSERT INTO ENTREGA (tareaID, alumnoID, linkEntrega, estadoEntrega) VALUES (?, ?, ?, ?)',
                [tareaID, alumnoID, linkEntrega, 'Entregado']
            );
            res.status(201).json({
                ok: true,
                entregaID: result.insertID,
                msj: 'Tarea entregada exitosamente'
            });
        }
    } catch(error) {
        console.error("Error al entregar tarea:", error);
        res.status(500).json({
            ok: false,
            msj: 'Error interno del servidor al intentar entregar la tarea'
        });
    }
};
    


export const alumnoController = {AlumTarea, entreTarea};