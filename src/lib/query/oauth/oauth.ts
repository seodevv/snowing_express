import { pool } from '@/lib/db';
import logger from '@/lib/logger';
import {
  BasicInfo,
  insert_basicinfo,
  OAuth,
  select_basicinfo,
  select_oauth,
  update_basicinfo,
} from '@/lib/query/oauth/query';

export async function selectBasicInfo(args: {
  name: string;
  key: string;
}): Promise<BasicInfo | undefined> {
  const queryOptions = select_basicinfo(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<BasicInfo[]>(queryOptions);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

export async function selectOauth(args: {
  id: 'instagram' | 'google';
  type: string;
}): Promise<OAuth[]> {
  const queryOptions = select_oauth(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<OAuth[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function insertBasicInfo(args: {
  name: string;
  key: string;
  value: string;
}): Promise<{ result: boolean; message: string }> {
  try {
    const check = await selectBasicInfo(args);
    if (typeof check === 'undefined') {
      const queryOptions = insert_basicinfo(args);
      //logger.debug(queryOptions.sql);

      await pool.query<BasicInfo[]>(queryOptions);
      return { result: true, message: 'inserted' };
    }

    if (check.value !== args.value) {
      const updateOptions = update_basicinfo(args);
      // logger.debug(updateOptions.sql);

      await pool.query(updateOptions);
      return { result: true, message: 'updated' };
    }

    return { result: true, message: 'nothing to do' };
  } catch (error) {
    throw error;
  }
}
