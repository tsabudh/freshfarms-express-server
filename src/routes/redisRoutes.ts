import express from 'express';

const redisCache = require("../utils/redisCache");

const router = express.Router();

// router.route("/").get(redisCache.testCache);

export default router;
