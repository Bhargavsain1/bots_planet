const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 3, // limit to 3 login requests per window per IP
  message:
    "Too many incorrect login attempts , please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
module.exports = loginRateLimiter;
