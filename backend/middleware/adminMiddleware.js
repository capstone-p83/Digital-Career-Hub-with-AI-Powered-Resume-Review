function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin access only",
    });
  }

  next();
}

module.exports = adminMiddleware;