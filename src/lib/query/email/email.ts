import { pool } from '@/lib/db';
import logger from '@/lib/logger';
import {
  Email,
  insert_email,
  insert_subscribe,
  select_email,
  select_subscribe,
  Subscribe,
  update_email,
} from '@/lib/query/email/query';
import { QueryOptions } from 'mysql2';

export async function selectEmailInfo(): Promise<Email | undefined> {
  const queryOptions: QueryOptions = select_email();
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Email[]>(queryOptions);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

export async function insertEmailInfo(args: {
  id: string;
  password: string;
}): Promise<{ result: boolean; message: string }> {
  try {
    const check = await selectEmailInfo();

    if (typeof check === 'undefined') {
      const insertOptions = insert_email(args);
      logger.debug('[insertEmailInfo]\t', insertOptions.sql);
      await pool.query(insertOptions);
      return { result: true, message: 'inserted' };
    }

    if (check.password !== args.password) {
      const updateOptions = update_email(args);
      logger.debug('[insertEmailInfo]\t', updateOptions.sql);
      await pool.query(updateOptions);
      return { result: true, message: 'updated' };
    }

    return { result: true, message: 'nothing to do' };
  } catch (error) {
    throw error;
  }
}

export async function insertEmailSubscribe(
  email: string
): Promise<{ result: boolean; message: string }> {
  const selectOptions = select_subscribe(email);
  // logger.debug(selectOptions);

  try {
    const [rows] = await pool.query<Subscribe[]>(selectOptions);

    if (typeof rows[0] === 'undefined') {
      const insertOptions = insert_subscribe(email);
      // logger.debug(insertOptions);

      await pool.query(insertOptions);
      return { result: true, message: 'inserted' };
    }

    return { result: true, message: 'nothing to do' };
  } catch (error) {
    throw error;
  }
}
