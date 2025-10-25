import logger from '@/lib/logger';
import {
  selectAddress,
  selectCountry,
  selectOrder,
  selectOrderDelivery,
  selectOrderProduct,
  selectPromotion,
  selectProvince,
  selectWallets,
} from '@/lib/query/my/my';
import {
  Addresses,
  Country,
  Promotion,
  Province,
  Wallets,
} from '@/lib/query/my/query';
import { selectWish } from '@/lib/query/product/product';
import { Wish } from '@/lib/query/product/query';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import { TypedRequestQuery, TypedRequestQueryParams } from '@/model/Request';
import { TypedResponse } from '@/model/Response';
import { Request, Router } from 'express';

const router = Router();

// GET /get/my/order/:type
router.get(
  '/order/:type',
  async (
    req: TypedRequestQueryParams<
      { id?: string; userId?: string; addressId?: string },
      { type: string }
    >,
    res
  ) => {
    const { type } = req.params;
    const { id, userId, addressId } = req.query;
    if (
      type !== 'list' &&
      type !== 'product' &&
      type !== 'delivery' &&
      type !== 'address'
    ) {
      return httpBadRequestResponse(res);
    }

    try {
      switch (type) {
        case 'list': {
          if (typeof userId === 'undefined') {
            return httpBadRequestResponse(res);
          }
          const result = await selectOrder({ userId });
          return httpSuccessResponse(res, { data: result });
        }
        case 'product': {
          if (typeof id === 'undefined') {
            return httpBadRequestResponse(res);
          }
          // logger.debug(parseInt(id));
          const result = await selectOrderProduct({ orderId: id });
          return httpSuccessResponse(res, { data: result });
        }
        case 'delivery': {
          if (typeof id === 'undefined') {
            return httpBadRequestResponse(res);
          }

          const result = await selectOrderDelivery({ orderId: id });
          return httpSuccessResponse(res, { data: result });
        }

        case 'address': {
          if (typeof addressId === 'undefined') {
            return httpBadRequestResponse(res);
          }
          const result = await selectAddress({ id: addressId });

          return httpSuccessResponse(res, { data: result[0] });
        }
      }
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/my/country
router.get(
  '/country',
  async (
    req: Request,
    res: TypedResponse<{ data?: Country[]; message: string }>
  ) => {
    try {
      const country = await selectCountry();

      return httpSuccessResponse(res, { data: country });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/my/province
router.get(
  '/province',
  async (
    req: TypedRequestQuery<{ countryId?: string }>,
    res: TypedResponse<{ data?: Province[]; message: string }>
  ) => {
    const { countryId } = req.query;
    if (typeof countryId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const province = await selectProvince({ countryId });

      return httpSuccessResponse(res, { data: province });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/my/address
router.get(
  '/address',
  async (
    req: TypedRequestQuery<{ user?: string; id?: string }>,
    res: TypedResponse<{ data?: Addresses[]; message: string }>
  ) => {
    const { user, id } = req.query;

    try {
      const address = await selectAddress({ user, id });

      return httpSuccessResponse(res, { data: address });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/my/wallets
router.get(
  '/wallets',
  async (
    req: TypedRequestQuery<{ user?: string; id?: string }>,
    res: TypedResponse<{ data?: Wallets[]; message: string }>
  ) => {
    const { user, id } = req.query;

    try {
      const wallets = await selectWallets({ user, id });
      return httpSuccessResponse(res, { data: wallets });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/my/wishlist
router.get(
  '/wishlist',
  async (
    req: TypedRequestQuery<{ userId?: string }>,
    res: TypedResponse<{ data?: Wish[]; message: string }>
  ) => {
    const { userId } = req.query;
    if (typeof userId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const wish = await selectWish({ userId });
      return httpSuccessResponse(res, { data: wish });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/my/promotion
router.get(
  '/promotion',
  async (
    req: TypedRequestQuery<{ userId?: string }>,
    res: TypedResponse<{ data?: Promotion[]; message: string }>
  ) => {
    const { userId } = req.query;
    if (typeof userId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const promotion = await selectPromotion({ userId });

      return httpSuccessResponse(res, { data: promotion });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

export default router;
