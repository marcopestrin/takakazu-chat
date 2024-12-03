import { Client, QueryResult } from 'pg';

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

async function getRoomId(roomName: string): Promise<number | null> {
  const result: QueryResult = await client.query(`
    SELECT id
    FROM public.rooms
    WHERE name = '${roomName}';
  `);
  return result.rows.length > 0 ? result.rows[0].id : null;
};


export async function initializeDatabase(): Promise<void> {

  async function checkIfTablesExist(): Promise<boolean>  {
    const result: QueryResult = await client.query(`
      SELECT to_regclass('public.messages');
    `);
    return result.rows[0].to_regclass !== null;
  };
  
  async function createTables(): Promise<void> {
    await client.query(`
      CREATE TABLE public.rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      );
      CREATE TABLE public.messages (
        id SERIAL PRIMARY KEY,
        room_id INT,
        author VARCHAR(100) NOT NULL,
        "content" TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT messages_unique UNIQUE (id),
        CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE
      );
    `);
  };

  try {
    await client.connect();
    const tablesExist = await checkIfTablesExist();
    if (!tablesExist) {
      console.log("Creating tables...")
      await createTables();
    }
  } catch (err) {
    console.error("initializeDatabase:",err);
  }

};

export async function getRooms(): Promise<string[]> {
  try {
    const result: QueryResult = await client.query(`
      SELECT name FROM rooms
    `);
    return result.rows.map(row => row['name']);
  } catch(error) {
    console.error(error);
    return [];
  }
}

export async function saveMessage({ message, username, room }: Payload){
    try {
      await client.query('BEGIN');
      
      const roomResult: QueryResult = await client.query(`
        INSERT INTO public.rooms (name) VALUES ('${room}')
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `);
      console.log("roomResult:", roomResult)

      const roomId = roomResult.rows.length > 0
        ? roomResult.rows[0].id
        : await getRoomId(room);
      console.log("roomId:", roomId)
        
      if (!roomId) {
        throw new Error('Impossibile to get room id');
      }

      await client.query(`
        INSERT INTO public.messages (author, content, room_id)
        VALUES ('${username}', '${message}', ${roomId})
        RETURNING id;
      `);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
    }
};

export async function getMessages(roomName: string){
  try {
    const result: QueryResult = await client.query(`
      SELECT
        TO_CHAR(m.timestamp::DATE, 'DD-MM-YYYY') AS "messageDate",
        json_agg(
          json_build_object(
            'userId', m.author,
            'message', m."content",
            'timestamp', TO_CHAR(m.timestamp, 'HH24:MI')
          )
        ) AS messages
      FROM public.messages m
      JOIN public.rooms r ON m.room_id = r.id
      WHERE r.name = '${roomName}'
      GROUP BY "messageDate"
      ORDER BY MIN(m.timestamp);
    `)
    return result.rows;
  } catch (err) {
    console.error(err);   
    return [];
  }
};