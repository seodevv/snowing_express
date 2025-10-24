import { Request, Router } from 'express';
import logger from '../../lib/logger';
import { selectBasicInfo } from '@/lib/query/oauth/oauth';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import { TypedResponse } from '@/model/Response';
import { TypedRequestQuery } from '@/model/Request';
import { selectWish } from '@/lib/query/product/product';
import axios from 'axios';
import myRouter from '../my/getMy';

const router = Router();

// router.use('/product', require('../product/getProduct'));
router.use('/my', myRouter);

// GET /get/secret
// 시크릿 정보를 가져옴
router.get(
  '/secret',
  async (
    req: Request,
    res: TypedResponse<{ data?: string; message: string }>
  ) => {
    try {
      const result = await selectBasicInfo({
        name: 'encrypt',
        key: 'secret',
      });

      if (typeof result === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      return httpSuccessResponse(res, { data: result.value });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/wish
// 특정 user의 wish 리스트가 있는지 검사
router.get(
  '/wish',
  async (
    req: TypedRequestQuery<{ userId?: string; listId: string }>,
    res: TypedResponse<{ data?: boolean; message: string }>
  ) => {
    const { userId, listId } = req.query;
    if (typeof userId === 'undefined' || typeof listId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const check = await selectWish({ userId, listId });
      return httpSuccessResponse(res, { data: check.length !== 0 });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

router.get(
  '/insta/feeds',
  async (req: TypedRequestQuery<{ page?: string }>, res) => {
    const page = req.query.page || '0';
    const length = 12 * (~~page + 1);

    try {
      const user_id = await selectBasicInfo({
        name: 'instagram',
        key: 'user_id',
      });

      if (typeof user_id === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const access_token = await selectBasicInfo({
        name: 'instagram',
        key: 'access_token',
      });

      if (typeof access_token === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const request_url =
        'https://graph.instagram.com/' +
        user_id.value +
        '/media' +
        '?fields=id,media_type,media_url,permalink,thumbnail_url,username,caption,timestamp' +
        '&access_token=' +
        access_token?.value;
      const { data: getFeeds } = await axios.get(request_url);

      let data = getFeeds.data;
      let paging = getFeeds.paging;
      let isEnd = false;
      while (data.length < length) {
        if (isEnd) break;
        if (paging.next) {
          const { data: getMores } = await axios.get(paging.next);
          data = data.concat(getMores.data);
          paging = getMores.paging;
          if (!getMores.paging.next) isEnd = true;
        } else {
          isEnd = true;
        }
      }

      return httpSuccessResponse(res, {
        data: { feeds: data.slice(0, length), isEnd },
      });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

export default router;
