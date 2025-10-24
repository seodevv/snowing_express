import { Router } from 'express';
import nodeMailer from 'nodemailer';
import CryptoJS from 'crypto-js';
import { TypedRequestBody } from '@/model/Request';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import {
  insertEmailInfo,
  insertEmailSubscribe,
  selectEmailInfo,
} from '@/lib/query/email/email';
import { TypedResponse } from '@/model/Response';
import logger from '@/lib/logger';
import { selectBasicInfo } from '@/lib/query/oauth/oauth';
import { mailFormat } from '@/lib/common';

const router = Router();

// POST /post/mail/regist
router.post(
  '/regist',
  async (
    req: TypedRequestBody<{ id?: string; password?: string }>,
    res: TypedResponse<{ data?: boolean; message: string }>
  ) => {
    const { id, password } = req.body;

    if (typeof id === 'undefined' || typeof password === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const data = await insertEmailInfo({ id, password });

      return httpSuccessResponse(res, { data: data.result });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// POST /post/mail/subscribe
router.post(
  '/subscribe',
  async (req: TypedRequestBody<{ email: string }>, res) => {
    const { email } = req.body;
    if (typeof email === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      await insertEmailSubscribe(email);

      const secret = await selectBasicInfo({
        name: 'encrypt',
        key: 'secret',
      });

      if (typeof secret === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const email_sender = await selectEmailInfo();

      if (typeof email_sender === 'undefined') {
        return httpInternalServerErrorResponse(res);
      }

      const sender_id = email_sender.id;
      const sender_password = CryptoJS.AES.decrypt(
        email_sender.password,
        secret.value
      ).toString(CryptoJS.enc.Utf8);

      const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: { user: sender_id, pass: sender_password },
      });
      const mailOptions = {
        to: email,
        subject: '[Snowing] Thank you for subscribing.',
        html: mailFormat(
          'snowing',
          '[Snowing] Thank you for subscribing.',
          email,
          'https://localhost:5500'
        ),
      };
      const result = await transporter.sendMail(mailOptions);

      return httpSuccessResponse(res, { data: result.response });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

export default router;
