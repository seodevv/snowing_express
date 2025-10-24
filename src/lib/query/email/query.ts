import { QueryOptions, RowDataPacket } from 'mysql2';

export interface Email extends RowDataPacket {
  id: string;
  password: string;
}
export const select_email = () => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
  e.id,
  e.password
FROM
  EMAIL e
`,
  };
  return queryOptions;
};
export const insert_email = (args: { id: string; password: string }) => {
  const { id, password } = args;
  const queryOptions: QueryOptions = {
    sql: `INSERT INTO EMAIL VALUES (?, ?)`,
    values: [id, password],
  };
  return queryOptions;
};
export const update_email = (args: { id: string; password: string }) => {
  const { id, password } = args;
  const queryOptions: QueryOptions = {
    sql: `UPDATE EMAIL e SET e.id = ?, e.password = ?`,
    values: [id, password],
  };
  return queryOptions;
};

export interface Subscribe extends RowDataPacket {
  email: string;
}
export const select_subscribe = (email: string) => {
  const queryOptions: QueryOptions = {
    sql: `
  SELECT
  s.email
FROM
  SUBSCRIBE s
WHERE
  s.email = ?
`,
    values: [email],
  };
  return queryOptions;
};
export const insert_subscribe = (email: string) => {
  const queryOptions: QueryOptions = {
    sql: `INSERT INTO SUBSCRIBE VALUES(?)`,
    values: [email],
  };
  return queryOptions;
};
