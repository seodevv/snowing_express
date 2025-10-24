import appRoot from 'app-root-path';
import winston, { format, transports, Logger } from 'winston';
import { AxiosError } from 'axios';

// 에러 메시지 포맷 생성
const createErrorMessage = (error: any): string => {
  let message = `${error.message}\n`;
  message += `  ${error.stack}\n`;

  delete error.message;
  for (const key in error) {
    message += `\n  ${key}: ${error[key]}`;
  }

  return message;
};

// Error 객체를 문자열로 변환
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error || info instanceof AxiosError) {
    Object.assign(info, { message: createErrorMessage(info) });
  }
  return info;
});

const options = {
  // log파일
  file: {
    level: 'info',
    filename: `${appRoot}/logs/${process.env.APP_ID}.log`, // 로그파일을 남길 경로
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  // 개발 시 console에 출력
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false, // 로그형태를 json으로도 뽑을 수 있다.
    colorize: true,
  },
};

const logger: Logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp(),
    enumerateErrorFormat(),
    process.env.NODE_ENV === 'development'
      ? format.colorize()
      : format.uncolorize(),
    format.splat(),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`
    )
  ),
  transports: [new transports.File(options.file)],
});

// 개발 환경에서 console 로그 추가
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console(options.console));
}

// morgan 등에서 사용할 stream 객체를 추가
(logger as any).stream = {
  write: (message: string) => {
    logger.info(message.replace(/\r\n|\r|\n/, ''));
  },
};

export default logger;
