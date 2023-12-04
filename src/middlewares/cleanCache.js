const { clearHash } = require("../utils/redisCache");

const cleanCache = async (req, res, next) => {
  await next();
  clearHash();
};

module.exports = cleanCache;
