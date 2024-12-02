import { Client } from 'pg';

interface Payload {
    username: string
    message: string
    room: string
};

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: false
});

export async function initializeDatabase() {
  try {
    await client.connect();

    const res = await client.query(`
      SELECT to_regclass('public.messages');
    `);

    if (res.rows[0].to_regclass === null) {
      await client.query(`
        CREATE TABLE public.messages (
          id SERIAL PRIMARY KEY,
          room VARCHAR(100) NOT NULL,
          author VARCHAR(100) NOT NULL,
          "content" TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT messages_unique UNIQUE (id)
        );
      `);
    }
  } catch (err) {
    console.error(err);
  }
}

export async function saveMessage({ message, username, room }: Payload){
    try {
      await client.query(`
        INSERT INTO messages(
          content,
          room,
          author
        ) VALUES (
         '${message}',
         '${room}',
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
        TO_CHAR(timestamp::DATE, 'DD-MM-YYYY') AS "messageDate",
        json_agg(
          json_build_object(
            'userId', author,
            'message', "content",
            'timestamp', TO_CHAR(timestamp, 'HH24:MI')
          )
        ) AS messages
      FROM public.messages
      GROUP BY "messageDate"
      ORDER BY MIN(timestamp);
    `)
    return result.rows;
  } catch (err) {
    console.error(err);   
    return [];
  }
};