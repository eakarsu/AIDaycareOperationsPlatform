const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.header('Authorization');

  if (!header) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) return res.status(503).json({ error: 'Authentication is not configured' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
