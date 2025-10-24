import { QueryOptions, RowDataPacket } from 'mysql2';

export interface BasicInfo extends RowDataPacket {
  name: string;
  key: string;
  value: string;
}
export const select_basicinfo = (args: { name: string; key: string }) => {
  const { name, key } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    bi.name,
    bi.key,
    bi.value
FROM
    BASIC_INFO bi
WHERE
    bi.name = ?
    AND bi.key = ?
`,
    values: [name, key],
  };
  return queryOptions;
};
export const insert_basicinfo = (args: {
  name: string;
  key: string;
  value: string;
}) => {
  const { name, key, value } = args;
  const queryOptions: QueryOptions = {
    sql: `INSERT INTO BASIC_INFO(\`name\`,\`key\`,\`value\`) VALUES (?, ?, ?)`,
    values: [name, key, value],
  };
  return queryOptions;
};
export const update_basicinfo = (args: {
  name: string;
  key: string;
  value: string;
}) => {
  const { name, key, value } = args;
  const queryOptions: QueryOptions = {
    sql: `UPDATE BASIC_INFO SET value = ? WHERE name = ? AND key = ?`,
    values: [value, name, key],
  };

  return queryOptions;
};

export interface OAuth extends RowDataPacket {
  id: string;
  type: string;
  request_url: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  redirect_uri: string;
}
export const select_oauth = (args: {
  id: 'instagram' | 'google';
  type: string;
}) => {
  const { id, type } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    o.id,
    o.type,
    o.request_url,
    o.client_id,
    o.client_secret,
    o.grant_type,
    o.redirect_uri
FROM
    OAUTH o
WHERE
    o.id = ?
    AND o.type = ?
`,
    values: [id, type],
  };
  return queryOptions;
};
