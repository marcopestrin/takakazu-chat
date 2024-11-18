import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); 

interface Payload {
    timestamp: string
    username: string
    message: string
}

const client = new Client({
  user: process.env.BE_DB_USER,
  host: process.env.BE_DB_HOST,
  database: process.env.BE_DB_NAME,
  password: process.env.BE_DB_PASSWORD,
  port: 5432,
});

export async function connectToDatabase() {
  try {
    // const aa = await client.connect();
    // console.log("--->",aa);

  } catch (err) {
    console.error('Errore durante la connessione al database:', err);
  }
}

export async function saveMessage(payload: Payload){
    // console.log(payload)
};

