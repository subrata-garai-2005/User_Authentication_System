const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication token required. Format: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_dev_key";
    const decoded = jwt.verify(token, jwtSecret);

    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;