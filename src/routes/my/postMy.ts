import logger from '@/lib/logger';
import {
  deleteAddresses,
  deleteWallets,
  insertAddresses,
  insertWallets,
  updateAddresesDefaultSetFalse,
  updateAddresses,
  updateWalletDefaultSetFalse,
  updateWallets,
} from '@/lib/query/my/my';
import { selectBasicInfo } from '@/lib/query/oauth/oauth';
import { selectUser, updateUser } from '@/lib/query/user/user';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpNotFoundResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import { TypedRequestBody, TypedRequestBodyParams } from '@/model/Request';
import { TypedResponse } from '@/model/Response';
import { Router } from 'express';

const jwt = require('jsonwebtoken');
const router = Router();

// POST /post/my/address/:type
router.post(
  '/address/:type',
  async (
    req: TypedRequestBodyParams<
      {
        id?: string;
        userId?: string;
        isDefault?: boolean;
        countryId?: string;
        provinceId?: string;
        lastName?: string;
        firstName?: string;
        postal_code?: string;
        city?: string;
        address?: string;
        etc?: string;
        phone?: string;
      },
      {
        type: string;
      }
    >,
    res: TypedResponse<{ message: string }>
  ) => {
    const { type } = req.params;
    const {
      id,
      userId,
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
    } = req.body;
    if (typeof userId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      if (isDefault) {
        await updateAddresesDefaultSetFalse({ userId });
      }

      switch (type) {
        case 'add': {
          if (
            typeof userId === 'undefined' ||
            typeof isDefault === 'undefined' ||
            typeof countryId === 'undefined' ||
            typeof provinceId === 'undefined' ||
            typeof lastName === 'undefined' ||
            typeof firstName === 'undefined' ||
            typeof postal_code === 'undefined' ||
            typeof city === 'undefined' ||
            typeof address === 'undefined' ||
            typeof etc === 'undefined' ||
            typeof phone === 'undefined'
          ) {
            return httpBadRequestResponse(res);
          }
          await insertAddresses({
            userId,
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
          });
          break;
        }
        case 'edit': {
          if (
            typeof id === 'undefined' ||
            typeof isDefault === 'undefined' ||
            typeof countryId === 'undefined' ||
            typeof provinceId === 'undefined' ||
            typeof lastName === 'undefined' ||
            typeof firstName === 'undefined' ||
            typeof postal_code === 'undefined' ||
            typeof city === 'undefined' ||
            typeof address === 'undefined' ||
            typeof etc === 'undefined' ||
            typeof phone === 'undefined'
          ) {
            return httpBadRequestResponse(res);
          }
          await updateAddresses({
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
          });
          break;
        }
        case 'delete': {
          if (typeof id === 'undefined') {
            return httpBadRequestResponse(res);
          }
          await deleteAddresses({ id });
          break;
        }
      }
      return httpSuccessResponse(res, {});
      // createResponse({ response: res });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
      // createResponse({ response: res, error, status: 500 });
    }
  }
);

// POST /post/my/wallets/:type
router.post(
  '/wallets/:type',
  async (
    req: TypedRequestBodyParams<
      { id?: string; userId?: string; isDefault?: boolean; card_data?: string },
      { type: string }
    >,
    res
  ) => {
    const { type } = req.params;
    const { id, userId, isDefault, card_data } = req.body;
    if (typeof userId === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      if (isDefault) {
        await updateWalletDefaultSetFalse({ userId });
      }

      switch (type) {
        case 'add': {
          if (
            typeof userId === 'undefined' ||
            typeof isDefault === 'undefined' ||
            typeof card_data === 'undefined'
          ) {
            return httpBadRequestResponse(res);
          }
          await insertWallets({ userId, isDefault, card_data });
          break;
        }
        case 'edit': {
          if (typeof id === 'undefined' || typeof card_data === 'undefined') {
            return httpBadRequestResponse(res);
          }
          await updateWallets({ id, card_data });
          break;
        }
        case 'delete': {
          if (typeof id === 'undefined') {
            return httpBadRequestResponse(res);
          }
          await deleteWallets({ id });
          break;
        }
      }
      return httpSuccessResponse(res, {});
      // createResponse({ response: res });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
      // createResponse({ response: res, error, status: 500 });
    }
  }
);

// POST /post/my/account
router.post(
  '/account',
  async (
    req: TypedRequestBody<{ id?: string; nick?: string; phone?: string }>,
    res: TypedResponse<{ message: string }>
  ) => {
    const { id, nick, phone } = req.body;
    if (
      typeof id === 'undefined' ||
      typeof nick === 'undefined' ||
      typeof phone === 'undefined'
    ) {
      return httpBadRequestResponse(res);
    }

    try {
      await updateUser({ id, nick, phone });
      // const [data] = await selectUser({ id });
      const user = await selectUser({ id });
      if (typeof user === 'undefined') {
        return httpNotFoundResponse(res, 'User not found');
      }

      // const { value: secret } = await selectBasicInfo({
      //   name: 'encrypt',
      //   key: 'secret',
      // });
      const secret = await selectBasicInfo({
        name: 'encrypt',
        key: 'secret',
      });

      if (typeof secret === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const token = jwt.sign(user, secret?.value);
      res.cookie('token', token, {
        sameSite: 'none',
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return httpSuccessResponse(res, {});
      // createResponse({ response: res });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
      // createResponse({ response: res, error, status: 500 });
    }
  }
);

export default router;
