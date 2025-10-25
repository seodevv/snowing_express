import {
  Brands,
  CartItem,
  Contact,
  ProductDetail,
  Productlist,
  ProductNavigator,
  ProductSize,
  Size,
} from './../../lib/query/product/query';
import logger from '@/lib/logger';
import {
  selectCartItems,
  selectContact,
  selectProductBanner,
  selectProductBrands,
  selectProductCategories,
  selectProductDetail,
  selectProductList,
  selectProductListById,
  selectProductNavigator,
  selectProductSize,
  selectProductSubject,
  selectProductType,
  selectSizeGroup,
} from '@/lib/query/product/product';
import {
  Banner,
  ProductCategories,
  ProductSubject,
  ProductType,
} from '@/lib/query/product/query';
import {
  httpBadRequestResponse,
  httpInternalServerErrorResponse,
  httpSuccessResponse,
} from '@/lib/responsesHandlers';
import { TypedRequestParams, TypedRequestQuery } from '@/model/Request';
import { TypedResponse } from '@/model/Response';
import { Request, Router } from 'express';

const router = Router();

// GET /get/product/banner
router.get(
  '/banner',
  async (
    req: TypedRequestQuery<{ type?: string; name?: string }>,
    res: TypedResponse<{
      data?: ProductType[] | ProductSubject[] | Banner[];
      message: string;
    }>
  ) => {
    const { type, name } = req.query;
    if (type !== 'type' && type !== 'subject' && type !== 'banner') {
      return httpBadRequestResponse(res);
    }

    try {
      switch (type) {
        case 'type': {
          const result = await selectProductType();
          return httpSuccessResponse(res, {
            data: result.map((v) => ({ ...v, banner: v.type })),
          });
        }
        case 'subject': {
          const result = await selectProductSubject({ name });
          return httpSuccessResponse(res, {
            data: result.map((v) => ({ ...v, banner: v.subject })),
          });
        }
        case 'banner':
          if (typeof name === 'undefined') {
            return httpBadRequestResponse(res);
          }
          const result = await selectProductBanner({ banner: name });
          return httpSuccessResponse(res, { data: result });
      }
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/category
router.get(
  '/category',
  async (
    req: TypedRequestQuery<{ category?: string }>,
    res: TypedResponse<{ data?: ProductCategories[]; message: string }>
  ) => {
    const { category } = req.query;
    if (typeof category === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const categories = await selectProductCategories({ category });
      return httpSuccessResponse(res, { data: categories });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/type
router.get(
  '/type',
  async (
    req: Request,
    res: TypedResponse<{ data?: ProductType[]; message: string }>
  ) => {
    try {
      const type = await selectProductType();
      return httpSuccessResponse(res, { data: type });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/subject
router.get(
  '/subject',
  async (
    req: Request,
    res: TypedResponse<{ data?: ProductSubject[]; message: string }>
  ) => {
    try {
      const subject = await selectProductSubject({});
      return httpSuccessResponse(res, { data: subject });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/list
router.get(
  '/list',
  async (
    req: TypedRequestQuery<{
      order?: string;
      limit?: string;
      brand?: string;
      price?: string;
      size?: string;
      category?: string;
      type?: string;
      subjects?: string;
    }>,
    // res: TypedResponse<{ data?: Productlist[]; message: string }>
    res
  ) => {
    const { order, limit, brand, price, size, category, type, subjects } =
      req.query;
    if (
      order !== 'main' &&
      order !== 'all' &&
      order !== 'new' &&
      order !== 'popular' &&
      order !== 'priceAsc' &&
      order !== 'priceDesc' &&
      order !== 'nameAsc' &&
      order !== 'nameDesc'
    ) {
      return httpBadRequestResponse(res);
    }

    try {
      const list = await selectProductList({
        order,
        limit: typeof limit !== 'undefined' ? ~~limit : undefined,
        brand,
        price,
        size,
        category,
        type,
        subjects,
      });

      return httpSuccessResponse(res, { data: list });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/list/:id
router.get(
  '/list/:id',
  async (
    req: TypedRequestParams<{ id?: string }>,
    res: TypedResponse<{ data?: Productlist; message: string }>
  ) => {
    const { id } = req.params;
    if (typeof id === 'undefined') {
      return httpBadRequestResponse(res);
    }
    // if (!id) return createResponse({ response: res, status: 400 });

    try {
      const list = await selectProductListById({ id });
      return httpSuccessResponse(res, { data: list });
      // createResponse({ response: res, data });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/navigator
router.get(
  '/navigator',
  async (
    req: TypedRequestQuery<{ id?: string }>,
    res: TypedResponse<{ data?: ProductNavigator; message: string }>
  ) => {
    const { id } = req.query;
    if (typeof id === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const navigator = await selectProductNavigator({ id });
      return httpSuccessResponse(res, { data: navigator });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/size
router.get(
  '/size',
  async (
    req: TypedRequestQuery<{ id?: string }>,
    res: TypedResponse<{ data?: ProductSize[]; message: string }>
  ) => {
    const { id } = req.query;
    if (typeof id === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const size = await selectProductSize({ id });
      return httpSuccessResponse(res, { data: size });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/size/group
router.get(
  '/size/group',
  async (
    req: Request,
    res: TypedResponse<{ data?: Size[]; message: string }>
  ) => {
    try {
      const group = await selectSizeGroup();
      return httpSuccessResponse(res, { data: group });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/detail
router.get(
  '/detail',
  async (
    req: TypedRequestQuery<{ id?: string }>,
    res: TypedResponse<{ data?: ProductDetail[]; message: string }>
  ) => {
    const { id } = req.query;
    if (typeof id === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const detail = await selectProductDetail({ id });
      return httpSuccessResponse(res, { data: detail });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/brands
router.get(
  '/brands',
  async (
    req: TypedRequestQuery<{ category?: string; brand?: string }>,
    res: TypedResponse<{ data?: Brands[]; message: string }>
  ) => {
    const { category, brand } = req.query;
    try {
      const brands = await selectProductBrands({ category, brand });
      return httpSuccessResponse(res, { data: brands });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/contact
router.get(
  '/contact',
  async (
    req: TypedRequestQuery<{ key?: string }>,
    res: TypedResponse<{ data?: Contact[]; message: string }>
  ) => {
    const { key } = req.query;
    try {
      const contact = await selectContact({ key });
      return httpSuccessResponse(res, { data: contact });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

// GET /get/product/cart
router.get(
  '/cart',
  async (
    req: TypedRequestQuery<{ user?: string; ids?: string }>,
    res: TypedResponse<{ data?: CartItem[]; message: string }>
  ) => {
    const { user, ids } = req.query;
    if (typeof user === 'undefined' || typeof ids === 'undefined') {
      return httpBadRequestResponse(res);
    }

    try {
      const cart = await selectCartItems({ user, ids });
      return httpSuccessResponse(res, { data: cart });
    } catch (error) {
      logger.error(error);
      return httpInternalServerErrorResponse(res);
    }
  }
);

export default router;
