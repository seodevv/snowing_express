import { pool } from '@/lib/db';
import logger from '@/lib/logger';
import {
  Banner,
  Brands,
  CartItem,
  CartRaw,
  Contact,
  delete_cartraw,
  delete_wish,
  insert_cartraw,
  insert_enquire,
  insert_wish,
  ProductCategories,
  ProductDetail,
  Productlist,
  ProductNavigator,
  ProductSize,
  ProductSubject,
  ProductType,
  select_banner,
  select_brands,
  select_cartitem,
  select_cartraw,
  select_contact,
  select_product_categories,
  select_product_list,
  select_product_list_by_id,
  select_product_subject,
  select_product_type,
  select_productdetail,
  select_productNavigator,
  select_productsize,
  select_size,
  select_wish,
  Size,
  update_cartraw_quantity,
  Wish,
} from '@/lib/query/product/query';
import { QueryOptions } from 'mysql2';

export async function selectProductBanner(args: {
  banner: string;
}): Promise<Banner[]> {
  const queryOptions: QueryOptions = select_banner(args.banner);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<Banner[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductBrands(args: {
  category?: string;
  brand?: string;
}): Promise<Brands[]> {
  const { category, brand } = args;
  const queryOptions: QueryOptions = select_brands(args);
  logger.debug(queryOptions);

  try {
    const params = [];
    if (category) params.push(category);
    if (brand) params.push(brand);

    const [rows] = await pool.query<Brands[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductCategories(args: {
  category: string;
}): Promise<ProductCategories[]> {
  const queryOptions = select_product_categories(args);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<ProductCategories[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductType(): Promise<ProductType[]> {
  const queryOptions = select_product_type();
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<ProductType[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductSubject(args: {
  main?: boolean;
  name?: string;
}): Promise<ProductSubject[]> {
  const queryOptions = select_product_subject(args);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<ProductSubject[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductList(args: {
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
}): Promise<Productlist[]> {
  const queryOptions: QueryOptions = select_product_list(args);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<Productlist[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductListById(args: {
  id: number;
}): Promise<Productlist | undefined> {
  const queryOptions: QueryOptions = select_product_list_by_id(args.id);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<Productlist[]>(queryOptions);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

export async function selectProductNavigator(args: {
  id: number;
}): Promise<ProductNavigator | undefined> {
  const queryOptions: QueryOptions = select_productNavigator(args.id);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<ProductNavigator[]>(queryOptions);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

export async function selectProductSize(args: {
  id: number;
}): Promise<ProductSize[]> {
  const queryOptions: QueryOptions = select_productsize(args.id);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<ProductSize[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProductDetail(args: {
  id: number;
}): Promise<ProductDetail[]> {
  const queryOptions: QueryOptions = select_productdetail(args.id);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<ProductDetail[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectWish(args: {
  userId?: string;
  listId?: string;
}): Promise<Wish[]> {
  const queryOptions: QueryOptions = select_wish(args);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<Wish[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectCartItems(args: {
  user: number;
  ids: string;
}): Promise<CartItem[]> {
  const queryOptions = select_cartitem(args);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<CartItem[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectContact(args: {
  key?: string;
}): Promise<Contact[]> {
  const queryOptions = select_contact(args);
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<Contact[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectSizeGroup(): Promise<Size[]> {
  const queryOptions = select_size();
  logger.debug(queryOptions);

  try {
    const [rows] = await pool.query<Size[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function insertWish(args: {
  userId: string;
  listId: string;
}): Promise<{ result: true; message: string }> {
  try {
    const wish = await selectWish(args);
    if (wish.length !== 0) {
      const deleteOptions = delete_wish(args);
      logger.debug(deleteOptions);

      await pool.query(deleteOptions);
      return { result: true, message: 'deleted' };
    }

    const insertOptions = insert_wish(args);
    logger.debug(insertOptions);

    await pool.query(insertOptions);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function insertCart(args: {
  user: number;
  product: number;
  size: number;
  quantity: number;
}): Promise<{ result: true; message: string }> {
  const selectOptions = select_cartraw(args);
  logger.debug(selectOptions);

  try {
    const [check] = await pool.query<CartRaw[]>(selectOptions);
    if (check.length === 0) {
      const insertOptions = insert_cartraw(args);
      logger.debug(insertOptions);

      await pool.query(insertOptions);
      return { result: true, message: 'inserted' };
    }

    const updateOptions = update_cartraw_quantity({
      ...args,
      type: 'increase',
    });
    logger.debug(updateOptions);

    await pool.query(updateOptions);
    return { result: true, message: 'updated' };
  } catch (error) {
    throw error;
  }
}

export async function insertEnquire(args: {
  first: string;
  last: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ result: true; message: string }> {
  const queryOption = insert_enquire(args);
  logger.debug(queryOption);

  try {
    await pool.query(queryOption);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function updateCart(args: {
  type: 'increase' | 'decrease';
  user: number;
  product: number;
  size: number;
}): Promise<{ result: true; message: string }> {
  const queryOption = update_cartraw_quantity(args);
  logger.debug(queryOption);

  try {
    await pool.query(queryOption);
    return { result: true, message: 'updated' };
  } catch (error) {
    throw error;
  }
}

export async function deleteCart(args: {
  user: number;
  product: number;
  size: number;
}): Promise<{ result: true; message: string }> {
  const queryOption = delete_cartraw(args);
  logger.debug(queryOption);

  try {
    await pool.query(queryOption);
    return { result: true, message: 'deleted' };
  } catch (error) {
    throw error;
  }
}
