import { pool } from '@/lib/db';
import logger from '@/lib/logger';
import {
  Addresses,
  Country,
  delete_addresses,
  delete_wallets,
  insert_addresses,
  insert_wallets,
  Order,
  OrderDelivery,
  OrderProduct,
  Promotion,
  Province,
  select_addresses,
  select_country,
  select_order,
  select_order_delivery,
  select_order_product,
  select_promotion,
  select_province,
  select_wallets,
  update_addresses,
  update_addresses_default_false,
  update_wallets_card_data,
  update_wallets_default_false,
  update_wallets_default_max,
  Wallets,
} from '@/lib/query/my/query';

export async function selectOrder(args: {
  id?: string;
  userId?: string;
}): Promise<Order[]> {
  const queryOptions = select_order(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Order[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectOrderProduct(args: {
  orderId?: string;
}): Promise<OrderProduct[]> {
  const queryOptions = select_order_product(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<OrderProduct[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectOrderDelivery(args: {
  orderId: string;
}): Promise<OrderDelivery[]> {
  const queryOptions = select_order_delivery(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<OrderDelivery[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectCountry(): Promise<Country[]> {
  const queryOptions = select_country();
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Country[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectProvince(args: {
  countryId: string;
}): Promise<Province[]> {
  const queryOptions = select_province(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Province[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectAddress(args: {
  user?: string;
  id?: string;
}): Promise<Addresses[]> {
  const queryOptions = select_addresses(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Addresses[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectWallets(args: {
  user?: string;
  id?: string;
}): Promise<Wallets[]> {
  const queryOptions = select_wallets(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Wallets[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function selectPromotion(args: {
  userId: string;
}): Promise<Promotion[]> {
  const queryOptions = select_promotion(args);
  //logger.debug(queryOptions.sql);

  try {
    const [rows] = await pool.query<Promotion[]>(queryOptions);
    return rows;
  } catch (error) {
    throw error;
  }
}

export async function insertAddresses(args: {
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
}): Promise<{ result: true; message: string }> {
  const queryOptions = insert_addresses(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function insertWallets(args: {
  userId: string;
  isDefault: boolean;
  card_data: string;
}): Promise<{ result: true; message: string }> {
  const queryOptions = insert_wallets(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function updateAddresesDefaultSetFalse(args: {
  userId: string;
}): Promise<{ result: true; message: string }> {
  const queryOptions = update_addresses_default_false(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function updateWalletDefaultSetFalse(args: {
  userId: string;
}): Promise<{ result: true; message: string }> {
  const queryOptions = update_wallets_default_false(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function updateAddresses(args: {
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
}): Promise<{ result: true; message: string }> {
  const queryOptions = update_addresses(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return { result: true, message: 'inserted' };
  } catch (error) {
    throw error;
  }
}

export async function updateWallets(args: {
  id: string;
  card_data: string;
}): Promise<true> {
  const queryOptions = update_wallets_card_data(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function deleteAddresses(args: { id: string }): Promise<true> {
  const queryOptions = delete_addresses(args);
  //logger.debug(queryOptions.sql);

  try {
    await pool.query(queryOptions);
    return true;
  } catch (error) {
    throw error;
  }
}

export async function deleteWallets(args: { id: string }) {
  const queryOptions = delete_wallets(args);
  //logger.debug(queryOptions.sql);

  try {
    const check = await selectWallets({ id: args.id });
    await pool.query(queryOptions);

    if (check[0] && check[0].isDefault) {
      const updateOptions = update_wallets_default_max(check[0].userid);
      // logger.debug(updateOptions);

      await pool.query(updateOptions);
    }

    return true;
  } catch (error) {
    throw error;
  }
}
