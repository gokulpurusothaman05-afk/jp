
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};

export default authorizeRoles;
