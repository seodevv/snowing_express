import logger from '@/lib/logger';
import {
  deleteCart,
  insertCart,
  insertEnquire,
  updateCart,
} from '@/lib/query/product/product';
import { CartItem } from '@/lib/query/product/query';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import { TypedRequestBody } from '@/model/Request';
import { TypedResponse } from '@/model/Response';
import { Router } from 'express';

const router = Router();

// POST /post/product/cart
router.post(
  '/cart',
  async (
    req: TypedRequestBody<{ type?: string; items?: CartItem[]; user?: string }>,
    res: TypedResponse<{ message: string }>
  ) => {
    const { type, items, user } = req.body;
    if (typeof items === 'undefined' || typeof user === 'undefined') {
      return httpBadRequestResponse(res);
    }

    items.forEach(async (item) => {
      try {
        switch (type) {
          case 'add':
            await insertCart({
              user: user,
              product: item.productId,
              size: item.sizeId,
              quantity: item.quantity,
            });
            break;
          case 'delete':
            await deleteCart({
              user: user,
              product: item.productId,
              size: item.sizeId,
            });
            break;
          case 'increase':
          case 'decrease':
            await updateCart({
              type: type,
              user: user,
              product: item.productId,
              size: item.sizeId,
            });
            break;
        }
      } catch (error) {
        logger.error(error);
      }
    });

    return httpSuccessResponse(res, {});
  }
);

// POST /post/product/enquire
router.post(
  '/enquire',
  async (
    req: TypedRequestBody<{
      first: string;
      last: string;
      email: string;
      phone: string;
      message: string;
    }>,
    res: TypedResponse<{ data?: { result: true }; message: string }>
  ) => {
    const { first, last, email, phone, message } = req.body;
    if (
      typeof first === 'undefined' ||
      typeof last === 'undefined' ||
      typeof email === 'undefined' ||
      typeof phone === 'undefined' ||
      typeof message === 'undefined'
    ) {
      return httpBadRequestResponse(res);
    }

    try {
      await insertEnquire({ first, last, email, phone, message });

      return httpSuccessResponse(res, { data: { result: true } });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

export default router;
