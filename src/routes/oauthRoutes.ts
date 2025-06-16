import express from "express";
import { oAuthCallback, oAuthCheck } from "../middlewares/oauth";

const router = express.Router();

router.route("/callback").get(oAuthCallback);

router.route("/check").get(oAuthCheck);

export default router;
