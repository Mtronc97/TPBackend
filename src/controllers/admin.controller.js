import { request, response } from "express";
import {getConnection} from '../database/database.js'


//Crear usuarios
const create = async (req = request, res = response ) => {
  const connection = await getConnection();
  const { nombre, email, rol } = req.body;


  //verificar que todos los campos estén completados
  if (!nombre || !email || !rol){
    return res.status(400).json({
      ok: false,
      msj: 'Todos los campos son obligatorios'
    });
  }

  //verificar que los campos que no se repita el email, ya que es un campo unico y no se puede repetir
  //enviamos mensaje de que el usuario ya se encuentra registrado
  try{
    const [existeUs] = await connection.query(
      'SELECT usuarioID FROM Usuario WHERE email = ?', 
      [email]
    );

    
    if (existeUs.length > 0 ){
      return res.status (409).json({
        ok: false,
        msj: 'Mail ya resgistrado con otro usuario'
      });
    }

  const [result] = await connection.query(
    'INSERT INTO usuario (nombre, email, rol) VALUES (?, ?, ?)',
    [nombre, email, rol] 
  );

  res.status(201).json({ ok: true, result, msg: 'Approved' });
} catch (error){
  console.error ("Error al crear usuario: ", error);
  res.status(500).json({
    ok: false,
    msj:'Error al intentar crear usuario'
  })
}
};

export const adminController = {create};

