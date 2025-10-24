import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from 'https';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { setupServer } from './lib/setup';
import logger from './lib/logger';
import { dbConnectionTest } from '@/lib/db';
import getRouter from './routes/api/get';
import postRouter from './routes/api/post';
import authRouter from './routes/auth/oauth';

// ENVIRONMENTS
const SERVER_HOST = process.env.SERVER_HOST || '0.0.0.0';
const SERVER_PORT = process.env.SERVER_PORT ? ~~process.env.SERVER_PORT : 8080;
const SERVER_ORIGIN = process.env.SERVER_ORIGIN
  ? process.env.SERVER_ORIGIN.split(',')
  : ['https://localhost', 'https://localhost:5500'];

// SETUP SERVER
const app = express();
const server = setupServer(app);

// CORS 설정
app.use(
  cors({
    origin: SERVER_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

// 로거 설정
app.use(
  morgan(':remote-addr - :remote-user :method :status :url :response-time ms', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// public config
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routing
app.use('/get', getRouter);
app.use('/post', postRouter);
app.use('/auth', authRouter);

server.listen(SERVER_PORT, SERVER_HOST, async () => {
  await dbConnectionTest();
  logger.info(
    `litening on ${
      server instanceof https.Server ? 'https' : 'http'
    }://${SERVER_HOST}:${SERVER_PORT}`
  );
});
