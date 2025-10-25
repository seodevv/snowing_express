import { QueryOptions, RowDataPacket } from 'mysql2';

export interface Order extends RowDataPacket {
  id: number;
  userId: number;
  statusId: number;
  status: string;
  addressId: number;
  modified: string;
  ordered: string;
}
export const select_order = (args: { id?: string; userId?: string }) => {
  const { id, userId } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    o.id,
    o.user AS userId,
    os.id AS statusId,
    os.status,
    o.address AS addressId,
    o.modified,
    o.ordered
FROM
    \`order\` o
INNER JOIN
    order_status os ON os.id = o.status
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof id !== 'undefined') {
    queryOptions.sql += ' AND o.id = ?\n';
    queryOptions.values.push(id);
  }

  if (typeof userId !== 'undefined') {
    queryOptions.sql += ' AND o.user = ?\n';
    queryOptions.values.push(userId);
  }

  queryOptions.sql += '  ORDER BY\n';
  queryOptions.sql += '    o.modified DESC\n';

  return queryOptions;
};

export interface OrderProduct extends RowDataPacket {
  orderId: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  sizeId: number;
  size: string;
  quantity: number;
}
export const select_order_product = (args: { orderId?: string }) => {
  const orderId = args.orderId;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    op.order AS orderId,
    pl.id AS productId,
    pl.name,
    pl.price,
    pl.image,
    s.id AS sizeId,
    s.size,
    op.quantity
FROM
    order_product op
INNER JOIN
    product_list pl ON pl.id = op.product
INNER JOIN
    sizes s ON s.id = op.size
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof orderId !== 'undefined') {
    queryOptions.sql += '    AND op.order = ?\n';
    queryOptions.values.push(orderId);
  }

  return queryOptions;
};

export interface OrderDelivery extends RowDataPacket {
  orderId: number;
  companyId: number;
  companyName: string;
  companyUrl: string;
  number: string;
  statusId: number;
  status: string;
  regist: string;
}
export const select_order_delivery = (args: { orderId: string }) => {
  const orderId = args.orderId;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    od.order AS orderId,
    dc.id AS companyId,
    dc.name AS companyName,
    dc.url AS companyUrl,
    od.number,
    os.id AS statusId,
    os.status,
    od.regist
FROM
    order_delivery od
INNER JOIN
    delivery_company dc ON dc.id = od.company
INNER JOIN
    order_status os ON os.id = od.status
WHERE
    od.order = ?
ORDER BY
    od.regist DESC
`,
    values: [orderId],
  };
  return queryOptions;
};

export interface Country extends RowDataPacket {
  countryId: number;
  country: string;
}
export const select_country = () => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    c.id as countryId,
    c.country
FROM
    country c
`,
  };
  return queryOptions;
};

export interface Province extends RowDataPacket {
  countryId: number;
  country: string;
  provinceId: number;
  province: string;
}
export const select_province = (args: { countryId: string }) => {
  const countryId = args.countryId;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    c.id AS countryId,
    c.country,
    p.id AS provinceId,
    p.province
FROM
    country c
INNER JOIN
    province p ON p.country = c.id
WHERE
    c.id = ?
`,
    values: [countryId],
  };

  return queryOptions;
};

export interface Addresses extends RowDataPacket {
  id: number;
  userId: number;
  countryId: number;
  country: string;
  provinceId: number;
  province: string;
  lastName: string;
  firstName: string;
  postal_code: number;
  city: string;
  address: string;
  etc: string;
  phone: string;
  isDefault: boolean;
}
export const select_addresses = (args: { user?: string; id?: string }) => {
  const { user, id } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    a.id,
    a.user AS userId,
    c.id AS countryId,
    c.country,
    p.id AS provinceId,
    p.province,
    a.lastname AS lastName,
    a.firstname AS firstName,
    a.postal_code,
    a.city,
    a.address,
    a.etc,
    a.phone,
    a.default AS isDefault
FROM
    addresses a
INNER JOIN
    country c ON c.id = a.country
INNER JOIN
    province p ON p.id = a.province
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof user !== 'undefined') {
    queryOptions.sql += '    AND a.user = ?\n';
    queryOptions.values.push(user);
  }

  if (typeof id !== 'undefined') {
    queryOptions.sql += '    AND a.id = ?\n';
    queryOptions.values.push(id);
  }

  queryOptions.sql += '  ORDER BY\n';
  queryOptions.sql += '    a.default DESC,\n';
  queryOptions.sql += '    a.id DESC\n';

  return queryOptions;
};
export const insert_addresses = (args: {
  userId: string;
  isDefault: boolean;
  countryId: string;
  provinceId: string;
  lastName: string;
  firstName: string;
  postal_code: string;
  city: string;
  address: string;
  etc: string;
  phone: string;
}) => {
  const {
    userId,
    countryId,
    provinceId,
    lastName,
    firstName,
    postal_code,
    city,
    address,
    etc,
    phone,
    isDefault,
  } = args;
  const queryOptions: QueryOptions = {
    sql: `
INSERT INTO addresses
    (\`user\`, 
    \`country\`, 
    \`province\`, 
    \`lastname\`,
    \`firstname\`,
    \`postal_code\`,
    \`city\`,
    \`address\`,
    \`etc\`,
    \`phone\`,
    \`default\`)
VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
    values: [
      userId,
      countryId,
      provinceId,
      lastName,
      firstName,
      postal_code,
      city,
      address,
      etc,
      phone,
      isDefault,
    ],
  };

  return queryOptions;
};
export const update_addresses = (args: {
  id: string;
  isDefault: boolean;
  countryId: string;
  provinceId: string;
  lastName: string;
  firstName: string;
  postal_code: string;
  city: string;
  address: string;
  etc: string;
  phone: string;
}) => {
  const {
    id,
    isDefault,
    countryId,
    provinceId,
    lastName,
    firstName,
    postal_code,
    city,
    address,
    etc,
    phone,
  } = args;
  const queryOptions: QueryOptions = {
    sql: `
UPDATE
    addresses a
  SET
    a.country = ?,
    a.province = ?,
    a.lastname = ?,
    a.firstname = ?,
    a.postal_code = ?,
    a.city = ?,
    a.address = ?,
    a.etc = ?,
    a.phone = ?,
    a.default = ?
  WHERE
    id = ?
`,
    values: [
      countryId,
      provinceId,
      lastName,
      firstName,
      postal_code,
      city,
      address,
      etc,
      phone,
      isDefault,
      id,
    ],
  };

  return queryOptions;
};
export const update_addresses_default_false = (args: { userId: string }) => {
  const userId = args.userId;
  const queryOptions: QueryOptions = {
    sql: `UPDATE addresses a SET a.default = false WHERE a.user = ?`,
    values: [userId],
  };

  return queryOptions;
};
export const delete_addresses = (args: { id: string }) => {
  const id = args.id;
  const queryOptions: QueryOptions = {
    sql: `DELETE FROM addresses WHERE id = ?`,
    values: [id],
  };

  return queryOptions;
};

export interface Wallets extends RowDataPacket {
  id: number;
  userid: number;
  isDefault: boolean;
  card_data: string;
}
export const select_wallets = (args: { user?: string; id?: string }) => {
  const { user, id } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    w.id,
    w.user as userId,
    w.isDefault,
    w.card_data
FROM
    wallets w
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof user !== 'undefined') {
    queryOptions.sql += '    AND w.user = ?\n';
    queryOptions.values.push(user);
  }

  if (typeof id !== 'undefined') {
    queryOptions.sql += '    AND w.id = ?\n';
    queryOptions.values.push(id);
  }

  queryOptions.sql += '  ORDER BY\n';
  queryOptions.sql += '    w.isDefault DESC,\n';
  queryOptions.sql += '    w.id DESC\n';

  return queryOptions;
};
export const insert_wallets = (args: {
  userId: string;
  isDefault: boolean;
  card_data: string;
}) => {
  const { userId, isDefault, card_data } = args;
  const queryOptions: QueryOptions = {
    sql: `INSERT INTO wallets(\`user\`, \`isDefault\`, \`card_data\`) VALUES (?, ?, ?)`,
    values: [userId, isDefault, card_data],
  };

  return queryOptions;
};
export const update_wallets_default_false = (args: { userId: string }) => {
  const userId = args.userId;
  const queryOptions: QueryOptions = {
    sql: `UPDATE wallets w SET w.isDefault = false WHERE w.user = ?`,
    values: [userId],
  };
  return queryOptions;
};
export const update_wallets_card_data = (args: {
  id: string;
  card_data: string;
}) => {
  const { id, card_data } = args;
  const queryOptions: QueryOptions = {
    sql: `UPDATE wallets w SET w.card_data = ? WHERE w.id = ?`,
    values: [card_data, id],
  };

  return queryOptions;
};
export const update_wallets_default_max = (user: number) => {
  const queryOptions: QueryOptions = {
    sql: `
UPDATE
    wallets w,
    (SELECT
        MAX(w.id) AS maxId
    FROM
        wallets w
    WHERE
        w.user = ?) a
SET
    w.isDefault = TRUE
WHERE
    w.id = a.maxId`,
    values: [user],
  };

  return queryOptions;
};
export const delete_wallets = (args: { id: string }) => {
  const id = args.id;
  const queryOptions: QueryOptions = {
    sql: `DELETE FROM wallets WHERE id = ?`,
    values: [id],
  };

  return queryOptions;
};

export interface Promotion extends RowDataPacket {
  userId: number;
  promotionId: number;
  promotionName: string;
  sales: number;
  expired: string;
}
export const select_promotion = (args: { userId: string }) => {
  const userId = args.userId;
  const queryOptions: QueryOptions = {
    sql: `
SELECT 
    pu.user as userId,
    p.id AS promotionId,
    p.name AS promotionName,
    p.sales AS sales,
    pu.expired
FROM 
    promotion_user pu
INNER JOIN
    promotion p ON p.id = pu.promotion
WHERE
    pu.user = ?
`,
    values: [userId],
  };

  return queryOptions;
};
