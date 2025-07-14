const jwt = require("jsonwebtoken");
// auth need to provide after login if anything need to use like profile
// for that  we need to provide these auth at router session
const { getTenantConnection } = require("../utils/db");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access Denied. No token provided." });
    }
    let tenant = jwt.verify(token, "your-secret-key");
    // Establish connection to the tenant's specific database instance using its mongoUri
    const tenantDbConnection = getTenantConnection({
      tenantId: tenant.tenantId,
      //  mongoUri: tenant.mongoUri
    });

    req.user = tenant;
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
