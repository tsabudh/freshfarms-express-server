import { Request, Response, NextFunction } from 'express';

import express from 'express';
import client from 'prom-client';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import transactionRouter from './routes/transactionRoutes';
import adminRouter from './routes/adminRoutes';
import productRouter from './routes/productRoutes';
import customerRouter from './routes/customerRoutes';
import contractRouter from './routes/contractRoutes';
import commonRouter from './routes/commonRoutes';
import messageRouter from './routes/messageRoutes';
import oAuthRouter from './routes/oauthRoutes';
import responseTime from 'response-time';

import AppError from './utils/appError';
import { healthChecker } from './utils/utils';
import LokiTransport from 'winston-loki';
import { createLogger } from 'winston';

const app = express();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });
const reqResTime = new client.Histogram({
  name: 'express_req_res_time',
  help: 'This tells how much time is taken by a request and response.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 1500, 2000],
});

app.use(
  responseTime((req: Request, res: Response, time: number) => {
    reqResTime
      .labels({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      })
      .observe(time);
  }),
);

const options = {
  defaultMeta: {
    appName: 'express',
  },
  transports: [
    new LokiTransport({
      labels: {
        app: 'express',
      },
      host: 'http://127.0.0.1:3100',
    }),
  ],
};
export const logger = createLogger(options);

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use('*', (_req: Request, _res: Response, next: NextFunction) => {
  logger.info('Hi there', { route: '/login', status: 200 });
  next();
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/v1/admins', adminRouter);

app.use('/api/v1/customers', customerRouter);

app.use('/api/v1/products', productRouter);
app.use('/api/v1/transactions', transactionRouter);
app.use('/api/v1/contracts', contractRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/common', commonRouter);
app.use('/api/auth/', oAuthRouter);

app.get('/api/health-check', healthChecker);
app.get('/metrics', async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.all('*', (_req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({
    status: 'failure',
    message: 'Missed the route.',
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  // If the error is an instance of AppError, use its properties
  if (error instanceof AppError) {
    logger.error(error.message);
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      caughtBy: 'expressGlobalErrorHandler',
      error: error,
    });
  }

  logger.error(error.message || 'Fatal: Unknown error!');

  return res.status(400).json({
    status: 'failure',
    message: error.message,
    caughtBy: 'expressGlobalErrorHandler',
    error: error,
  });
});

export default app;
