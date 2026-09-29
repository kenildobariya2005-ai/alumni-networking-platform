/**
 * Middleware to restrict route access based on user roles
 * @param {...(string|string[])} roles - The roles that are allowed to access the route
 */
export const authorizeRoles = (...roles) => {
  // Flatten array arguments and normalize to lowercase
  const allowedRoles = roles
    .flat()
    .map((role) => String(role).trim().toLowerCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized, user information not found in request',
      });
    }

    const userRole = String(req.user.role).trim().toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'`,
      });
    }

    next();
  };
};
