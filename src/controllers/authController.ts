import express from 'express';
import bcrypt from 'bcrypt';

import { verifyJWT } from '../utils/jwtUtils';

import Admin from '../models/Admin';
import AppError from '../utils/appError';
import { signJWT } from '../utils/jwtUtils';
import Customer from '../models/Customer';
import { logger } from '../app';

export const validateAdminAccount = async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username }).select('+password');
    if (admin && bcrypt.compareSync(password, admin.password)) {
      //- Setting up res.locals for loginAdmin middleware
      res.locals.currentUser = admin.id;
      res.locals.userRole = 'admin';

      next();
    } else {
      throw new Error('Account not found. Incorrect password or username.');
    }
  } catch (error: any) {
    console.log(error);
    res.send({
      status: 'failure',
      message: error.message,
    });
  }
};
export const validateCustomerAccount = async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  try {
    const { username, password } = req.body;
    const customer = await Customer.findOne({ username: username }).select('+password');
    if (customer && bcrypt.compareSync(password, customer.password)) {
      //- Setting up res.locals for login customer middleware
      res.locals.currentUser = customer.id;
      res.locals.userRole = 'customer';
      next();
    } else {
      throw new Error('Account not found. Incorrect password or username.');
    }
  } catch (error: any) {
    logger.log(error);
    res.status(400).send({
      status: 'failure',
      message: error.message,
    });
  }
};

export const loginAccount = async (
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  try {
    const payload = {
      currentUser: res.locals.currentUser,
      userRole: res.locals.userRole,
    };

    const token = signJWT(payload);

    if (!token) throw new AppError('Could not sign token.', 400);

    let user;
    if (payload.userRole == 'admin') {
      user = await Admin.findById(payload.currentUser);
    } else if (payload.userRole == 'customer') {
      user = await Customer.findById(payload.currentUser);
    }

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: false, // TODO set to true in production
        sameSite: 'lax', // TODO fix this in production
        maxAge: 3600 * 1000,
      })
      .status(200)
      .json({
        status: 'success',
        user,
        token,
      });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      status: 'failure',
      message: error.message,
    });
  }
};

export const checkAuthentication = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const bearerHeader = req.headers.authorization;
    const cookieAccessToken = req.cookies['access_token'];

    // Extract token from Bearer header if present and valid
    let bearerToken = null;
    if (typeof bearerHeader === 'string' && bearerHeader.startsWith('Bearer ')) {
      const tokenPart = bearerHeader.split(' ')[1];
      // Ignore literal "null" or "undefined"
      if (tokenPart && tokenPart !== 'null' && tokenPart !== 'undefined') {
        bearerToken = tokenPart;
      }
    }

    // Final JWT token to use: prefer Bearer > cookie
    const jwtToken =
      typeof bearerToken === 'string'
        ? bearerToken
        : typeof cookieAccessToken === 'string'
          ? cookieAccessToken
          : null;

    if (!jwtToken) {
      return res.status(401).json({
        status: 'failure',
        message: 'Authorization token not provided. Please log in.',
      });
    }

    // Verify token (assumed verifyJWT throws on invalid token)
    let decoded: any;
    try {
      decoded = verifyJWT(jwtToken);
    } catch (err: any) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({
        status: 'failure',
        message: 'Invalid or expired token.',
      });
    }

    // Extract user info from decoded token
    const currentUser = decoded.currentUser || decoded.sub;
    // const currentUser = decoded.currentUser;
    const userRole = decoded.userRole;

    if (!currentUser || !userRole) {
      return res.status(401).json({
        status: 'failure',
        message: 'Token missing required user info!',
      });
    }

    // Fetch user from DB according to role
    let user;
    if (userRole === 'admin') {
      user = await Admin.findById(currentUser);
    } else if (userRole === 'customer') {
      user = await Customer.findById(currentUser);
    } else {
      return res.status(403).json({
        status: 'failure',
        message: 'User role not recognized.',
      });
    }

    if (!user) {
      throw new AppError(
        `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} with given ID does not exist!`,
        404,
      );
    }

    // Save user info for downstream middleware/controllers
    res.locals.currentUser = currentUser;
    res.locals.userRole = userRole;

    return next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    next(error);
  }
};
export const restrictTo =
  (...userRoles: string[]) =>
  (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = res.locals.userRole;
    if (!userRole) {
      return next(new AppError('User role not found in request context.', 400));
    }
    // Limit routes to customer
    if (!userRoles.includes(userRole)) {
      return next(new AppError('Permission denied. Please contact your administrator.', 403));
    }

    next();
  };

export const logoutAccount = (
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  res.send({
    status: 'success',
    token: 'Invalid Token',
  });
};

export const refreshJWTToken = async (
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  try {
    const bearerHeader = req.headers.authorization;

    if (!bearerHeader) {
      throw new AppError('Authorization not provided!', 400);
    }
    const bearerToken = bearerHeader.split(' ')[1];
    if (!bearerToken) {
      throw new AppError('Bearer token not provided!', 400);
    }
    const returnedObject: any = verifyJWT(bearerToken);
    // returnedObject = JSON.parse(returnedObject as string);

    if (returnedObject instanceof Error) {
      res.status(401).json({
        status: 'failure',
        message: returnedObject.message,
      });
      throw new AppError(returnedObject.message, 404);
    }

    const payload = {
      currentUser: res.locals.currentUser,
      userRole: res.locals.userRole,
    };

    const token = signJWT(payload);
    if (!token) throw new AppError('Could not sign token.', 400);

    let user;
    if (payload.userRole == 'admin') {
      user = await Admin.findById(payload.currentUser);
    } else if (payload.userRole == 'customer') {
      user = await Customer.findById(payload.currentUser);
    }

    if (!user) throw new AppError('You need to log in again...', 400);

    res.status(200).json({
      status: 'success',
      user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'failure',
      message: error.message,
    });
  }
};
