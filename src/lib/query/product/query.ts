import { QueryOptions, RowDataPacket } from 'mysql2';

export interface Banner extends RowDataPacket {
  id: number;
  banner: string;
  image: string;
}
export const select_banner = (banner: string): QueryOptions => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    b.id,
    b.banner,
    b.image
FROM
    BANNER b
WHERE
    b.banner = ?
`,
    values: [banner],
  };

  return queryOptions;
};

export interface Brands extends RowDataPacket {
  id: number;
  category: string;
  brand: string;
  logo: string;
  image: string | null;
  desc: string;
}
export const select_brands = (args: {
  category?: string;
  brand?: string;
}): QueryOptions => {
  const { category, brand } = args;

  const queryOptions: QueryOptions = {
    sql: `
SELECT
    b.id,
    c.category,
    b.brand,
    b.logo,
    b.image,
    b.desc
FROM
    BRANDS b
INNER JOIN BRANDS_CATEGORY bc ON bc.brand = b.id
INNER JOIN CATEGORY c ON c.id = bc.category
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof category !== 'undefined') {
    queryOptions.sql += `   AND c.category = ?\n`;
    queryOptions.values.push(category);
  }

  if (typeof brand !== 'undefined') {
    queryOptions.sql += `   AND c.brand = ?\n`;
    queryOptions.values.push(brand);
  }

  queryOptions.sql += `GROUP BY\n`;
  queryOptions.sql += `     b.rand\n`;
  queryOptions.sql += `ORDER BY\n`;
  queryOptions.sql += `     b.brand`;

  return queryOptions;
};

export interface ProductCategories extends RowDataPacket {
  id: number;
  category: string;
  type: string;
  subject: string;
  order: number;
}
export const select_product_categories = (args: { category: string }) => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    ps.id,
    c.category,
    pt.type,
    ps.subject,
    ps.order
FROM
    CATEGORY c
INNER JOIN PRODUCT_TYPE pt ON pt.category = c.id
INNER JOIN PRODUCT_SUBJECT ps ON ps.type = pt.id
WHERE
    c.category = ?
ORDER BY
    pt.id,
    ps.order
`,
    values: [args.category],
  };
  return queryOptions;
};

export interface ProductType extends RowDataPacket {
  id: number;
  category: string;
  type: string;
  image: string;
}
export const select_product_type = () => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    pt.id,
    c.category,
    pt.type,
    pt.image
FROM
    PRODUCT_TYPE pt
INNER JOIN CATEGORY c
    ON c.id = pt.category`,
  };
  return queryOptions;
};

export interface ProductSubject extends RowDataPacket {
  id: number;
  category: string;
  type: string;
  subject: string;
  show_main: boolean;
  image: string;
  order: number;
}
export const select_product_subject = (args: {
  main?: boolean;
  name?: string;
}) => {
  const { main, name } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    ps.id,
    c.category,
    pt.type,
    ps.subject,
    ps.show_main,
    ps.image,
    ps.order
  FROM
    PRODUCT_SUBJECT ps
  INNER JOIN PRODUCT_TYPE pt
    ON pt.id = ps.type
  INNER JOIN CATEGORY c
    ON c.id = pt.category
  WHERE
    1 = 1    
`,
    values: [],
  };

  if (typeof main !== 'undefined') {
    queryOptions.sql += `    AND ps.show_main IS ?\n`;
    queryOptions.values.push(main);
  }

  if (typeof name !== 'undefined') {
    queryOptions.sql += `    AND ps.subject = ?\n`;
    queryOptions.values.push(name);
  }

  return queryOptions;
};

export interface Productlist extends RowDataPacket {
  id: number;
  subjectName: string;
  brandName: string;
  brandLogo: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  order: number;
  regist: string;
  sell: number;
}
export const select_product_list = (args: {
  order:
    | 'main'
    | 'all'
    | 'new'
    | 'popular'
    | 'priceAsc'
    | 'priceDesc'
    | 'nameAsc'
    | 'nameDesc';
  limit: number;
  brand: string;
  price?: number;
  size?: number;
  category?: string;
  type?: string;
  subjects?: string;
}) => {
  const {
    order = 'recent',
    limit = 22,
    brand,
    price,
    size,
    category,
    type,
    subjects,
  } = args;

  const queryOptions: QueryOptions = {
    sql: `
SELECT 
    pl.id,
    ps.subject AS subjectName,
    b.brand as brandName,
    b.logo as brandLogo,
    pl.name,
    pl.desc,
    pl.price,
    pl.image,
    pl.order,
    pl.regist,
    pl.sell
FROM 
    PRODUCT_LIST pl
INNER JOIN PRODUCT_SUBJECT ps ON ps.id = pl.subject
INNER JOIN PRODUCT_TYPE pt ON pt.id = ps.type
    ${
      typeof category !== 'undefined'
        ? `INNER JOIN 
		(SELECT 
			id, 
			category 
		FROM 
			CATEGORY 
		WHERE 
			category = ?) c
		ON c.id = pt.category`
        : ''
    }
INNER JOIN BRANDS b ON b.id = pl.brand
  ${
    typeof size !== 'undefined'
      ? `INNER JOIN
    (SELECT
        id
      FROM
        PRODUCT_SIZE
      WHERE
        size IN (${size})
      GROUP BY
        id) s
      ON s.id = pl.id`
      : ''
  }
  WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof category !== 'undefined') {
    queryOptions.values.push(category);
  }

  if (typeof brand !== 'undefined' && brand !== 'all') {
    queryOptions.sql += `   AND b.brand = ?\n`;
    queryOptions.values.push(brand);
  }

  if (typeof price !== 'undefined') {
    queryOptions.sql += `   AND pl.price <= ?\n`;
    queryOptions.values.push(price);
  }

  if (typeof type !== 'undefined') {
    queryOptions.sql += `   AND pt.type = ?\n`;
    queryOptions.values.push(type);
  }

  if (typeof subjects !== 'undefined') {
    const split = subjects.split(',');
    queryOptions.sql += `   AND ps.subject IN (${split
      .map(() => '?')
      .toString()})\n`;
    queryOptions.values.concat(split);
  }

  if (order === 'main') {
    queryOptions.sql += '   AND ps.show_main IS TRUE\n';
  }

  queryOptions.sql += 'ORDER BY\n';

  switch (order) {
    case 'recent':
      queryOptions.sql += '   pl.regist DESC\n';
      break;
    case 'main':
      queryOptions.sql += '   pl.regist DESC\n';
      break;
    case 'all':
    case 'new':
      queryOptions.sql += '   pl.regist DESC\n';
      break;
    case 'popular':
      queryOptions.sql += '   pl.sell DESC\n';
      break;
    case 'priceAsc':
      queryOptions.sql += '   pl.price ASC\n';
      break;
    case 'priceDesc':
      queryOptions.sql += '   pl.price DESC\n';
      break;
    case 'nameAsc':
      queryOptions.sql += '   pl.name ASC\n';
      break;
    case 'nameDesc':
      queryOptions.sql += '   pl.name DESC\n';
      break;
  }

  queryOptions.sql += `LIMIT ?`;
  queryOptions.values.push(limit);

  return queryOptions;
};

export const select_product_list_by_id = (id: number) => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT 
    pl.id,
    ps.subject AS subjectName,
    b.brand as brandName,
    b.logo as brandLogo,
    pl.name,
    pl.desc,
    pl.price,
    pl.image,
    pl.order,
    pl.regist,
    pl.sell
FROM 
    PRODUCT_LIST pl
INNER JOIN PRODUCT_SUBJECT ps ON ps.id = pl.subject
INNER JOIN BRANDS b ON b.id = pl.brand
WHERE
    pl.id = ?
`,
    values: [id],
  };

  return queryOptions;
};

export interface ProductNavigator extends RowDataPacket {
  id: number;
  category: string;
  type: string;
  subject: string;
  name: string;
}
export const select_productNavigator = (id: number) => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    pl.id,
    c.category,
    pt.type,
    ps.subject,
    pl.name
  FROM
    PRODUCT_TYPE pt
INNER JOIN PRODUCT_SUBJECT ps ON ps.type = pt.id
INNER JOIN CATEGORY c ON c.id = pt.category
INNER JOIN PRODUCT_LIST pl ON pl.subject = ps.id
WHERE
    pl.id = ?
`,
    values: [id],
  };

  return queryOptions;
};

export interface ProductSize extends RowDataPacket {
  id: number;
  sizeId: number;
  size: string;
  quantity: number;
}
export const select_productsize = (id: number) => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    ps.id,
    s.id as sizeId,
    s.size,
    ps.quantity
FROM
    PRODUCT_SIZE ps
INNER JOIN SIZES s ON s.id = ps.size
WHERE
    ps.id = ?
ORDER BY
    s.order
`,
    values: [id],
  };

  return queryOptions;
};

export interface ProductDetail extends RowDataPacket {
  id: number;
  detail: number;
  text: string;
}
export const select_productdetail = (id: number) => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    pd.id,
    pd.detail,
    d.text
FROM
    PRODUCT_DETAIL pd
INNER JOIN DETAIL d ON d.id = pd.detail
WHERE
    pd.id = ?
`,
    values: [id],
  };

  return queryOptions;
};

export interface Wish extends RowDataPacket {
  userId: number;
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  order: number;
  regist: string;
  sell: number;
}
export const select_wish = (args: { userId?: string; listId?: string }) => {
  const { userId, listId } = args;

  const queryOptions: QueryOptions = {
    sql: `
SELECT
    w.userId,
    pl.id,
    pl.name,
    pl.desc,
    pl.price,
    pl.image,
    pl.order,
    pl.regist,
    pl.sell
FROM 
    wish w
INNER JOIN product_list pl ON pl.id = w.listId
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof userId !== 'undefined') {
    queryOptions.sql += `    AND w.userId = ?\n`;
    queryOptions.values.push(userId);
  }

  if (typeof listId !== 'undefined') {
    queryOptions.sql += `    AND w.listId = ?\n`;
    queryOptions.values.push(listId);
  }

  return queryOptions;
};
export const insert_wish = (args: { userId: string; listId: string }) => {
  const { userId, listId } = args;
  const queryOptions: QueryOptions = {
    sql: `INSERT INTO WISH VALUES(?, ?)`,
    values: [userId, listId],
  };
  return queryOptions;
};
export const delete_wish = (args: { userId: string; listId: string }) => {
  const { userId, listId } = args;
  const queryOptions: QueryOptions = {
    sql: `DELETE FROM WISH WHERE userId = ? AND listId = ?`,
    values: [userId, listId],
  };

  return queryOptions;
};

export interface CartRaw extends RowDataPacket {
  user: number;
  product: number;
  size: number;
  quantity: number;
}
export interface CartItem extends RowDataPacket {
  id: number;
  userId: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  sizeId: number;
  size: string;
  quantity: number;
}
export const select_cartraw = (args: {
  user: number;
  product: number;
  size: number;
}) => {
  const { user, product, size } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    c.user,
    c.product,
    c.size,
    c.quantity
FROM
    CART c
WHERE
    c.user = ?
    AND c.product = ?
    AND c.size = ?
`,
    values: [user, product, size],
  };
  return queryOptions;
};
export const select_cartitem = (args: { user: number; ids: string }) => {
  const { user, ids } = args;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    c.id,
    c.user as userId,
    pl.id as productId,
    pl.name,
    pl.price,
    pl.image,
    c.size as sizeId,
    s.size,
    c.quantity
FROM
    CART c
INNER JOIN PRODUCT_LIST pl ON pl.id = c.product
INNER JOIN SIZES s ON s.id = c.size
WHERE
    1 = 1
`,
    values: [],
  };

  if (typeof user !== 'undefined') {
    queryOptions.sql += `    AND c.user = ?\n`;
    queryOptions.values.push(user);
  }

  if (typeof ids !== 'undefined') {
    const split = ids.split(',');
    queryOptions.sql += `    AND c.id IN (${split
      .map(() => '?')
      .toString()})\n`;
    queryOptions.values.concat(split);
  }

  queryOptions.sql += `ORDER BY\n`;
  queryOptions.sql += `    c.id\n`;

  return queryOptions;
};
export const insert_cartraw = (args: {
  user: number;
  product: number;
  size: number;
  quantity: number;
}) => {
  const { user, product, size, quantity } = args;
  const queryOptions: QueryOptions = {
    sql: 'INSERT INTO CART(`user`,`product`,`size`,`quantity`) VALUES (?, ?, ?, ?)',
    values: [user, product, size, quantity],
  };
  return queryOptions;
};
export const update_cartraw_quantity = (args: {
  type: 'increase' | 'decrease';
  user: number;
  product: number;
  size: number;
}) => {
  const { type, user, product, size } = args;
  const queryOptions: QueryOptions = {
    sql: `UPDATE CART c set c.quantity = ${
      type === 'increase' ? 'c.quantity + 1' : 'c.quantity - 1'
    } where c.user = ? AND c.product = ? AND c.size = ?`,
    values: [user, product, size],
  };
  return queryOptions;
};
export const delete_cartraw = (args: {
  user: number;
  product: number;
  size: number;
}) => {
  const { user, product, size } = args;
  const queryOptions: QueryOptions = {
    sql: 'DELETE FROM CART WHERE `user`= ? AND `product` = ? AND `size` = ?',
    values: [user, product, size],
  };
  return queryOptions;
};

export interface Contact extends RowDataPacket {
  id: number;
  key: string;
  value: string;
}
export const select_contact = (args: { key?: string }) => {
  const key = args.key;
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    c.id,
    c.key,
    c.value
FROM
    CONTACT c
`,
    values: [],
  };

  if (typeof key !== 'undefined') {
    const split = key.split(',');
    queryOptions.sql += `WHERE\n`;
    queryOptions.sql += `    c.key IN (${split.map(() => '?').toString()})`;
    queryOptions.values.concat(split);
  }

  return queryOptions;
};

export interface Size extends RowDataPacket {
  id: number;
  size: string;
  order: number;
}
export const select_size = () => {
  const queryOptions: QueryOptions = {
    sql: `
SELECT
    s.id,
    s.size,
    s.order
FROM
    SIZES s
ORDER BY
    s.order; 
`,
    values: [],
  };

  return queryOptions;
};

export const insert_enquire = (args: {
  first: string;
  last: string;
  email: string;
  phone: string;
  message: string;
}) => {
  const { first, last, email, phone, message } = args;
  const queryOptions: QueryOptions = {
    sql: `INSERT INTO ENQUIRE(firstname, lastname, email, phone, message) VALUES  (?, ?, ?, ?, ?)`,
    values: [first, last, email, phone, message],
  };

  return queryOptions;
};
