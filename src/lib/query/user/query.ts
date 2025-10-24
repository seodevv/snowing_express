import { QueryOptions, RowDataPacket } from 'mysql2';

export interface User extends RowDataPacket {
  id: number;
  type: string;
  email: string;
  password?: string | null;
  nick: string;
  phone: string | null;
  address: string | null;
  pictrue: string;
  regist: string;
}
export const select_user = (args: {
  id?: number;
  type?: 'app' | 'google';
  password?: boolean;
  email?: string;
}) => {
  const { id, type, password, email } = args;

  const queryOptions: QueryOptions = {
    sql: `
SELECT
    u.id,
    u.type,
    u.email,
    ${password ? 'u.password,' : ''}
    u.nick,
    u.phone,
    u.address,
    u.picture,
    u.regist
FROM
    USER u
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof id !== 'undefined') {
    queryOptions.sql += `   AND u.id = ?\n`;
    queryOptions.values.push(id);
  }
  if (typeof type !== 'undefined') {
    queryOptions.sql += `   AND u.type = ?\n`;
    queryOptions.values.push(type);
  }
  if (typeof email !== 'undefined') {
    queryOptions.sql += `   AND u.email = ?\n`;
    queryOptions.values.push(email);
  }

  return queryOptions;
};
export const insert_user = `
INSERT INTO USER(type, email, password, nick, picture) VALUES (?, ?, ?, ?, ?)
`;
export const update_user = `
UPDATE user u SET u.nick = ?, u.phone = ? WHERE u.id = ?
`;
