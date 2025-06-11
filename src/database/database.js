import mysql from 'mysql2/promise';
import { envs } from '../configuration/envs.js';

const connection = mysql.createConnection({
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    database: envs.DATABASE,
    user: envs.DB_USER,
    password: envs.DB_PASSWORD
});

export const getConnection = () => {
    console.log('Connected to the database');
    return connection;
}