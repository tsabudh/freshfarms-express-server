const express = require("express");

const redisCache = require("../utils/redisCache");

const router = express.Router();

// router.route("/").get(redisCache.testCache);

module.exports = router;
