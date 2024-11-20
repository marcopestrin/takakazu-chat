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
  ssl: {
    rejectUnauthorized: false
  }
});

export async function connectToDatabase() {
  try {
    await client.connect();
  } catch (err) {
    console.error(err);
  }
}

export async function saveMessage({ timestamp, message, username }: Payload){
    try {
      await client.query(`
        INSERT INTO messages(
          timestamp,
          content,
          author
        ) VALUES (
         '${timestamp}',
         '${message}',
         '${username}'
        );
      `);
    } catch (err) {
      console.error(err);
    }
};

export async function getMessages(){
  try {
    const result = await client.query(`
      SELECT
        author AS "userId",
        content AS message,
        timestamp
      FROM messages;
    `);
    return result.rows;
  } catch (err) {
    console.error(err);   
    return [];
  }
};
