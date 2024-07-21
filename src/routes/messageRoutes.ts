import express from 'express';

import * as authController from "../controllers/authController";
import * as messageController from "../controllers/messageController";
const router = express.Router();

router.use(authController.checkAuthentication);
router.route("/getMyMessages").get(messageController.getMyMessages);

export default router;