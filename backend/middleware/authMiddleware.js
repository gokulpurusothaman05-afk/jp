
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token required."
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 5. Attach user details to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    // 6. Continue to next middleware/controller
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default protect;
