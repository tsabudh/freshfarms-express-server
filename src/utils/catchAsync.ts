import { Request, Response, NextFunction } from 'express';

const catchAsync = function (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch((err: any) => next(err));
};
export default catchAsync;
