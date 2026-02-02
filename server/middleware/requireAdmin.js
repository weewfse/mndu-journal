module.exports = function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
}
