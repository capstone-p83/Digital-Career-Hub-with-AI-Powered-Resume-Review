function adminMiddleware(req, res, next) {
  if (!req.user || req.user.is_admin !== true) {
    return res.status(403).json({
      status: "error",
      message: "Admin access only",
    });
  }

  next();
}

module.exports = adminMiddleware;