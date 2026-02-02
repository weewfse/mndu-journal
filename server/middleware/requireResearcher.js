module.exports = function requireResearcher(req, res, next) {
  if (!req.session || !req.session.user || (req.session.user.role !== 'researcher' && req.session.user.role !== 'admin')) {
    return res.status(403).json({ ok: false, error: 'Researcher or admin access required' });
  }
  next();
}
