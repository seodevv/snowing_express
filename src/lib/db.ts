import mysql, { RowDataPacket } from 'mysql2/promise';
import logger from '@/lib/logger';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? ~~process.env.DB_PORT : 3306,
  database: process.env.DB_INSTANCE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 50,
  dateStrings: ['DATE'],
});

export const dbConnectionTest = async () => {
  let selectQuery = 'SELECT 1 as test FROM DUAL';
  const [rows] = await pool.query<TestRow[]>(selectQuery);
  logger.info(
    `[${process.env.DB_INSTANCE}][${process.env.DB_HOST}:${process.env.DB_PORT}] DB Connection Success`
  );
  return rows;
};

interface TestRow extends RowDataPacket {
  test: number;
}
