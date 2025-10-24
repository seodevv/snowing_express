import {
  insertBasicInfo,
  selectBasicInfo,
  selectOauth,
} from '@/lib/query/oauth/oauth';
import { User } from '@/lib/query/user/query';
import { insertUser, selectUser } from '@/lib/query/user/user';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpNotFoundResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import {
  TypedRequestBody,
  TypedRequestCookies,
  TypedRequestQuery,
} from '@/model/Request';
import { TypedResponse } from '@/model/Response';
import axios from 'axios';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import logger from '@/lib/logger';
import { selectEmailInfo } from '@/lib/query/email/email';
import nodeMailer from 'nodemailer';
import { authMailFormat, capitalize } from '@/lib/common';

const router = Router();

// GET /auth/insta/code
router.get(
  '/insta/code',
  async (req: TypedRequestQuery<{ code?: string }>, res) => {
    const { code } = req.query;

    if (typeof code === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const [getTokenInfo] = await selectOauth({
        id: 'instagram',
        type: 'getToken',
      });
      const { data: tokenData } = await axios<{
        user_id: string;
        access_token: string;
      }>({
        method: 'post',
        url: getTokenInfo.request_url,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          client_id: getTokenInfo.client_id,
          client_secret: getTokenInfo.client_secret,
          grant_type: getTokenInfo.grant_type,
          redirect_uri: getTokenInfo.redirect_uri,
          code,
        },
      });

      insertBasicInfo({
        name: 'instagram',
        key: 'user_id',
        value: tokenData.user_id,
      });

      const [getLongTokenInfo] = await selectOauth({
        id: 'instagram',
        type: 'getLongToken',
      });
      const { data: longTokenData } = await axios<{ access_token: string }>(
        getLongTokenInfo.request_url +
          '?grant_type=' +
          getLongTokenInfo.grant_type +
          '&client_secret=' +
          getLongTokenInfo.client_secret +
          '&access_token=' +
          tokenData.access_token
      );

      insertBasicInfo({
        name: 'instagram',
        key: 'access_token',
        value: longTokenData.access_token,
      });

      // createResponse({ response: res, data: longTokenData.access_token });
      httpSuccessResponse(res, { data: longTokenData.access_token });
    } catch (error) {
      // createResponse({ response: res, status: 500, error });
      httpInternalServerErrorResponse(res);
    }
  }
);

// POST /auth/user/login/google
router.post(
  '/user/login/google',
  async (
    req: TypedRequestBody<{ access_token?: string; token_type?: string }>,
    res: TypedResponse<{ data?: User; message: string }>
  ) => {
    const { access_token, token_type } = req.body;
    if (
      typeof access_token === 'undefined' ||
      typeof token_type === 'undefined'
    ) {
      // return createResponse({ response: res, status: 400 });
      return httpBadRequestResponse(res);
    }

    try {
      const [{ request_url }] = await selectOauth({
        id: 'google',
        type: 'getProfile',
      });
      const config = {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      };
      const {
        data: { email, name, picture },
      } = await axios.get(request_url, config);
      const data = await insertUser({
        type: 'google',
        email,
        password: null,
        nick: name,
        picture,
      });
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

      const token = jwt.sign(data, secret.value);
      res.cookie('token', token, {
        sameSite: 'none',
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      // createResponse({ response: res, data });
      return httpSuccessResponse(res, { data });
    } catch (error) {
      console.error(error);
      // createResponse({ response: res, status: 500, error });
      return httpInternalServerErrorResponse(res);
    }
  }
);

// POST /auth/user/login/app
//
router.post(
  '/user/login/app',
  async (
    req: TypedRequestBody<{ email?: string; password?: string }>,
    res: TypedResponse<{
      data?: (User & { result: true }) | { result: false };
      message: string;
    }>
  ) => {
    const { email, password } = req.body;

    if (typeof email === 'undefined' || typeof password === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const secret = await selectBasicInfo({
        name: 'encrypt',
        key: 'secret',
      });

      if (typeof secret === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const user = await selectUser({ type: 'app', email, password: true });

      if (typeof user === 'undefined' || !user.password) {
        return httpNotFoundResponse(res, 'User not found');
      }

      const decryptPassword = CryptoJS.AES.decrypt(
        password,
        secret.value
      ).toString(CryptoJS.enc.Utf8);
      const comparePassword = CryptoJS.AES.decrypt(
        user.password,
        secret.value
      ).toString(CryptoJS.enc.Utf8);

      console.log('decryptPassword', decryptPassword);
      console.log('comparePassword', comparePassword);

      if (decryptPassword === comparePassword) {
        delete user.password;
        const token = jwt.sign(user, secret.value);
        res.cookie('token', token, {
          sameSite: 'none',
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return httpSuccessResponse(res, { data: { ...user, result: true } });
      } else {
        res.cookie('token', '', {
          sameSite: 'none',
          httpOnly: true,
          secure: true,
          maxAge: 0,
        });
        return httpSuccessResponse(res, { data: { result: false } });
      }
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /auth/user/login/info
router.get('/user/login/info', async (req: TypedRequestCookies, res) => {
  // const { token } = req.cookies;
  const { 'access.token': token } = req.cookies;
  if (typeof token === 'undefined') {
    // return createResponse({ response: res, status: 400 });
    return httpBadRequestResponse(res);
  }

  try {
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

    // const { id, type, email } = jwt.verify(token, secret.value);
    const { id, type, email } = jwt.verify(token, secret.value) as {
      id: number;
      type: 'app' | 'google';
      email: string;
    };
    // const [data] = await selectUser({ id, type, email });
    const user = await selectUser({ id, type, email });

    if (typeof user === 'undefined') {
      return httpNotFoundResponse(res, 'User not found');
    }

    // createResponse({ response: res, data });
    return httpSuccessResponse(res, { data: user });
  } catch (error) {
    logger.error(error);
    // createResponse({ response: res, status: 500, error });
    return httpInternalServerErrorResponse(res);
  }
});

// POST /auth/user/signup/duplicated
router.post(
  '/user/signup/duplicated',
  async (
    req: TypedRequestBody<{ email?: string }>,
    res: TypedResponse<{ data?: { duplicated: boolean }; message: string }>
  ) => {
    const { email } = req.body;
    if (typeof email === 'undefined') {
      // return createResponse({ response: res, status: 400 });
      return httpBadRequestResponse(res);
    }

    try {
      // const [duplicate] = await selectUser({ type: 'app', email });
      const user = await selectUser({ type: 'app', email });

      // if (duplicate) {
      //   createResponse({ response: res, data: { duplicated: true } });
      // } else {
      //   createResponse({ response: res, data: { duplicated: false } });
      // }
      if (typeof user !== 'undefined') {
        return httpSuccessResponse(res, { data: { duplicated: true } });
      }
      return httpSuccessResponse(res, { data: { duplicated: false } });
    } catch (error) {
      logger.error(error);
      // createResponse({ response: res, error, status: 500 });
      return httpInternalServerErrorResponse(res);
    }
  }
);

// POST /auth/user/signup/code
router.post(
  '/user/signup/code',
  async (
    req: TypedRequestBody<{ email?: string }>,
    res: TypedResponse<{ data?: string; message: string }>
  ) => {
    const { email } = req.body;
    if (typeof email === 'undefined') {
      // return createResponse({ response: res, status: 400 });
      return httpBadRequestResponse(res);
    }

    try {
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

      // const [senderInfo] = await selectEmailInfo();
      const email = await selectEmailInfo();

      if (typeof email === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const sender_id = email.id;
      const sender_password = CryptoJS.AES.decrypt(
        email.password,
        secret.value
      ).toString(CryptoJS.enc.Utf8);

      const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: { user: sender_id, pass: sender_password },
      });
      const app = 'snowing';
      const subject = `[${capitalize(app)}] Email verification request`;
      const otp = Math.random().toString(36).substring(2, 8).toUpperCase();
      await transporter.sendMail({
        to: email.id,
        subject,
        html: authMailFormat(app, subject, email.id, otp),
      });

      // createResponse({ response: res, data: otp });
      return httpSuccessResponse(res, { data: otp });
    } catch (error) {
      logger.error(error);
      // createResponse({ response: res, error, status: 500 });
      return httpInternalServerErrorResponse(res);
    }
  }
);

// POST /auth/user/signup/regist
router.post(
  '/user/signup/regist',
  async (req: TypedRequestBody<{ email?: string; password?: string }>, res) => {
    const { email, password } = req.body;
    if (typeof email === 'undefined' || typeof password === 'undefined')
      return httpBadRequestResponse(res);
    // return createResponse({ response: res, status: 400 });

    try {
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

      const user = await insertUser({
        type: 'app',
        email,
        password,
        nick: email.replace(/@[a-zA-Z\.]+/, ''),
        picture: 'profile.png',
      });
      const token = jwt.sign(user, secret);
      res.cookie('token', token, {
        sameSite: 'none',
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // createResponse({ response: res, data });
      return httpSuccessResponse(res, { data: user });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
      // createResponse({ response: res, status: 500, error });
    }
  }
);

// POST /auth/user/logout
router.post('/user/logout', async (req, res) => {
  res.cookie('token', '', {
    sameSite: 'none',
    httpOnly: true,
    secure: true,
    maxAge: 0,
  });
  return httpSuccessResponse(res, {});
  // createResponse({ response: res });
});

export default router;
