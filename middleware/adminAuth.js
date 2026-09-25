const crypto = require('crypto');

const sessions = new Set();

function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.add(token);

  return token;
}

function deleteSession(token) {
  sessions.delete(token);
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (!sessions.has(token)) {
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }

  next();
}

module.exports = {
  createSession,
  deleteSession,
  requireAdmin
};