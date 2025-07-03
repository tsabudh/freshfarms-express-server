import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

router
  .route('/refreshToken')
  .get(authController.checkAuthentication, authController.refreshJWTToken);

export default router;
