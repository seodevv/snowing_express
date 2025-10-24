import { httpBadRequestResponse } from '@/lib/responsesHandlers';
import { TypedRequestBodyParams } from '@/model/Request';
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
        type?: string;
      }
    >,
    res
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
    if (type !== 'add' && type !== 'edit') {
      return httpBadRequestResponse(res);
    }
    if (typeof id !== 'undefined')
      if (
        !id ||
        (['add', 'edit'].includes(type) &&
          (!userId ||
            typeof isDefault !== 'boolean' ||
            !countryId ||
            !provinceId ||
            !lastName ||
            !firstName ||
            !city ||
            !address ||
            !phone))
      ) {
        return createResponse({ response: res, status: 400 });
      }
    try {
      if (isDefault) {
        await updateAddresesDefaultSetFalse({ userId });
      }

      switch (type) {
        case 'add':
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
        case 'edit':
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
        case 'delete':
          await deleteAddresses({ id });
          break;
      }
      createResponse({ response: res });
    } catch (error) {
      createResponse({ response: res, error, status: 500 });
    }
  }
);

router.post('/wallets/:type', async (req, res) => {
  const { type } = req.params;
  const { id, userId, isDefault, card_data } = req.body;
  if (
    (type === 'add' && (!userId || !isDefault || !card_data)) ||
    (type === 'edit' && (!id || !isDefault || !card_data)) ||
    (type === 'delete' && !id)
  ) {
    return createResponse({ response: res, status: 400 });
  }

  try {
    if (isDefault) {
      await updateWalletDefaultSetFalse({ userId });
    }

    switch (type) {
      case 'add':
        await insertWallets({ userId, isDefault, card_data });
        break;
      case 'edit':
        await updateWallets({ id, isDefault, card_data });
        break;
      case 'delete':
        await deleteWallets({ id });
        break;
    }
    createResponse({ response: res });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

router.post('/account', async (req, res) => {
  const { id, nick, email, phone } = req.body;
  if (!id || !nick || !phone)
    return createResponse({ response: res, status: 400 });

  try {
    await updateUser({ id, nick, phone });
    const [data] = await selectUser({ id });
    const { value: secret } = await selectBasicInfo({
      name: 'encrypt',
      key: 'secret',
    });
    const token = jwt.sign(data, secret);
    res.cookie('token', token, {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    createResponse({ response: res });
  } catch (error) {
    createResponse({ response: res, error, status: 500 });
  }
});

export default router;
