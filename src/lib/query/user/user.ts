import { pool } from '@/lib/db';
import {
  insert_user,
  select_user,
  update_user,
  User,
} from '@/lib/query/user/query';
import { QueryOptions, ResultSetHeader } from 'mysql2';

export async function selectUser(args: {
  id?: number;
  type?: 'app' | 'google';
  password?: boolean;
  email?: string;
}): Promise<User | undefined> {
  const queryOptions: QueryOptions = select_user(args);

  try {
    const [rows] = await pool.query<User[]>(queryOptions);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

export async function insertUser(args: {
  type: 'app' | 'google';
  email: string;
  password: string | null;
  nick: string;
  picture: string;
}): Promise<User> {
  const { type = 'app', email, password = null, nick, picture } = args;

  try {
    const user = await selectUser({ type, email });

    if (typeof user === 'undefined') {
      const queryOptions: QueryOptions = {
        sql: insert_user,
        values: [type, email, password, nick, picture],
      };
      const [result] = await pool.query<ResultSetHeader>(queryOptions);
      const data = await selectUser({ id: result.insertId });
      return data as User;
    }

    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(args: {
  id: number;
  nick: string;
  phone: string;
}) {
  const { id, nick, phone } = args;

  const queryOptions: QueryOptions = {
    sql: update_user,
    values: [nick, phone, id],
  };

  try {
    await pool.query(queryOptions);
    return true;
  } catch (error) {
    throw error;
  }
}
