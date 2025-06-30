const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access Denied. No token provided." });
    }
    let decoded = jwt.verify(token, "yourSecretKey");

    req.user = decoded;
    next();
  } catch (error) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please login again." });
    } else if (err.name === "JsonWebTokenError") {
      return res
        .status(403)
        .json({ error: "Invalid token. Please provide a valid token." });
    } else {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
module.exports = auth;
