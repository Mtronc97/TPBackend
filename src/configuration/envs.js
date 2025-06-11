// Importación de las librerias
import joi from 'joi';
import dotenv from 'dotenv';

// Traemos las variables de entorno usando dotenv
dotenv.config()

// Creamos el esquema de joi
const envsSchema = joi.object({
    // Validamos las variables que van a coexistir en nuestro proyecto
    PORT: joi.number().required(),
    DB_USER: joi.string().required(),
    DB_PASSWORD: joi.string().allow('').required(),
    DATABASE: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_HOST: joi.string().required()
    // Las mismas son las que colocamos en el archivo ".env"
}).unknown(true) // => Permitimos que traigan todas las variables, incluso las que no están en el esquema

// Validamos que este todo correctamente
const { value: envVars, error } = envsSchema.validate(process.env);

// Si existe un error, que lo lance antes de levantar el servidor 
if(error) throw new Error(`Error de validacion : ${error.message}`)

// Por ultimo, las exportamos para que sean visibles en todo el proyecto donde se las necesite llamar
export const envs = {
    PORT: envVars.PORT,
    DB_USER: envVars.DB_USER,
    DB_PASSWORD: envVars.DB_PASSWORD,
    DATABASE: envVars.DATABASE,
    DB_PORT: envVars.DB_PORT,
    DB_HOST: envVars.DB_HOST
}