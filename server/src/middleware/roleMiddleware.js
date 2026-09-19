// =============================================
// server/src/middleware/roleMiddleware.js
// Role-Based Authorization Middleware (RBAC)
// =============================================
// Usage:
//   router.get('/admin-only', protect, authorize('ADMIN'), controller);
//   router.get('/clinical', protect, authorize('ADMIN', 'DOCTOR'), controller);
// =============================================

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized: User authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access Forbidden: Role '${req.user.role}' does not have permission to access this resource.`
      );
    }

    next();
  };
};
