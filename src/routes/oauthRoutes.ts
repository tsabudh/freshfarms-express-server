import express from 'express';
import { oAuthCallback } from '../middlewares/oauth';

const router = express.Router();

router.route('/callback').get(oAuthCallback);

export default router;
