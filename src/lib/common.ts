import logger from '@/lib/logger';
import { Response } from 'express';

export function capitalize(str: string) {
  return str.replace(/^[a-z]/, (item) => item.toLocaleUpperCase());
}

export function mailFormat(
  app: string,
  subject: string,
  target: string,
  url: string
) {
  return `<div style="margin: 50px auto; display: block; width: 600px;">
  <table style="padding: 15px; border: 1px solid #999; border-radius: 5px; font-family: sans-serif;">
      <thead>
          <tr style="text-align: center;">
              <td style="padding: 15px 30px; font-weight: bold; border-bottom: 1px solid #777">
                  <img src="https://seodevv.github.io/${app}.png" alt="logo" width="200px">
                  <h2 style="margin: 0;">
                  ${subject.replace(/^\[[a-zA-Z]+\]\s/, '')}
                  </h2>
              </td>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td style="padding: 0 20px;">
                  <p style="margin: 15px 0;">
                    <strong style="color: #0f8a81; font-size: 1.1rem;">
                      Thank you for subscribing.
                    </strong>
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    From now on,
                    <br/>
                    [${target}]
                    <br/>
                    can receive ${capitalize(app)}'s newsletters.
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    Please look forward to ${capitalize(
                      app
                    )}’s various snow items.
                  </p>
                  <div style="width: 100%">
                    <a href="${url}" style="margin: 20px 0; padding: 15px 25px; display: inline-block; background: #15c; border-radius: 5px; font-size:24px; color: #fff; text-decoration: none;">
                      visit
                    </a>
                  </div>
              </td>
          </tr>
      </tbody>
  </table>
</div>`;
}

export function authMailFormat(
  app: string,
  subject: string,
  target: string,
  otp: string
) {
  return `<div style="margin: 50px auto; display: block; width: 600px;">
  <table style="padding: 15px; border: 1px solid #999; border-radius: 5px; font-family: sans-serif;">
      <thead>
          <tr style="text-align: center;">
              <td style="padding: 15px 30px; font-weight: bold; border-bottom: 1px solid #777">
                  <img src="https://seodevv.github.io/${app}.png" alt="logo" width="200px">
                  <h2 style="margin: 0;">
                  ${subject.replace(/^\[[a-zA-Z]+\]\s/, '')}
                  </h2>
              </td>
          </tr>
      </thead>
      <tbody>
          <tr>
              <td style="padding: 0 20px;">
                  <p style="margin: 15px 0;">
                    <strong style="color: #0f8a81; font-size: 1.1rem;">
                    Email verification has been requested from [${capitalize(
                      app
                    )}].
                    </strong>
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    If you are 
                    <strong style="font-size: 1rem; text-decoration: underline;">
                      ${target},
                    </strong> 
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    Please enter the code below into 
                    <strong style="font-size: 1rem; text-decoration: underline;">
                      ${capitalize(app)}.
                    </strong>
                  </p>
                  <h1 style="margin: 30px 0; text-align: center; text-decoration: underline;">${otp}</h1>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    This code is a one-time use and will not be reused.
                  </p>
                  <p style="margin: 5px 0; font-size: 1rem;">
                    If you don't know 
                    <strong style="font-size: 1rem; text-decoration: underline;">
                      ${capitalize(app)}
                    </strong>
                    , please ignore this email.
                  </p>
              </td>
          </tr>
      </tbody>
  </table>
</div>`;
}

interface HTTP20_<T> {
  response: Response;
  status: 200 | 201 | 204;
  data?: T;
  message?: string;
}
interface HTTP30_ {
  response: Response;
  status: 307;
  url: string;
  message?: string;
}
interface HTTP40_ {
  response: Response;
  status: 400 | 401 | 403 | 404;
  message?: string;
}
interface HTTP50_ {
  response: Response;
  status: 500;
  message?: string;
}
export function createResponse<T extends any>(args: HTTP20_<T>): unknown;
export function createResponse(args: HTTP30_): unknown;
export function createResponse(args: HTTP40_): unknown;
export function createResponse(args: HTTP50_): unknown;
export function createResponse<T>(
  args: HTTP20_<T> | HTTP30_ | HTTP40_ | HTTP50_
): unknown {
  const { response, status, message } = args;

  switch (status) {
    case 200:
      response.status(200).json({ data: args.data, message: message || 'OK' });
      break;
    case 201:
      response
        .status(201)
        .json({ data: args.data, message: message || 'Created' });
      break;
    case 204:
      response.status(204).json({ message: message || 'No Content' });
      break;
    case 307:
      response.redirect(args.url);
      break;
    case 400:
      response.status(400).json({ message: message || 'Bad Request' });
      break;
    case 401:
      response.status(401).json({ message: message || 'Unauthorized' });
      break;
    case 403:
      response.status(403).json({ message: message || 'Forbidden' });
      break;
    case 404:
      response.status(404).json({ message: message || 'Not Found' });
      break;
    case 500:
      response.status(500).json({
        message: message || 'Internal Server Error',
      });
      break;
  }
  return;
}
