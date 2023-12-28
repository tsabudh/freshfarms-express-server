import express from "express";

import { deleteCache } from "../controllers/cacheController";

const router = express.Router();

router.route("/").post(deleteCache);

export default router;
