import logger from '@/lib/logger';
import { insertWish } from '@/lib/query/product/product';
import {
  httpBadRequestResponse,
  httpCreatedResponse,
  httpInternalServerErrorResponse,
} from '@/lib/responsesHandlers';
import { TypedRequestBody } from '@/model/Request';
import { TypedResponse } from '@/model/Response';
import { Router } from 'express';
import mailRouter from '../mail/mail';

const router = Router();

router.use('/mail', mailRouter);
// router.use('/product', require('../product/postProduct'));
// router.use('/my', require('../my/postMy'));

// POST /post/wish
// 특정 user의 wish 리스트를 추가
router.post(
  '/wish',
  async (
    req: TypedRequestBody<{ userId?: string; listId?: string }>,
    res: TypedResponse<{ message: string }>
  ) => {
    const { userId, listId } = req.body;
    if (typeof userId === 'undefined' || typeof listId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      await insertWish({ userId, listId });
      return httpCreatedResponse(res, {});
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

export default router;
