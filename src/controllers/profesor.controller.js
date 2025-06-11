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
        })
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
            [usuarioID, materiaID]
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

export const profeController = {matriAlumno};