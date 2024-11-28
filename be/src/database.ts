import { Client } from 'pg';

interface Payload {
    username: string
    message: string
}

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: false
});

export async function createTableIfNotExists() {
  try {
    await client.connect()
    return await client.query(`
      CREATE TABLE public.messages (
        author VARCHAR(100) NOT NULL,
        "content" TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        id SERIAL PRIMARY KEY,
        CONSTRAINT messages_unique UNIQUE (id)
      );
    `);
  } catch (error) {
    console.error(error);
    return //process.exit(1);
  }
}



export async function saveMessage({ message, username }: Payload){
    try {
      await client.query(`
        INSERT INTO messages(
          content,
          author
        ) VALUES (
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
