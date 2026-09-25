const express = require('express');

const {
  createSession,
  deleteSession
} = require('../middleware/adminAuth');

const router = express.Router();

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'admin123';

router.post('/login', (req, res) => {
  const {
    login,
    password
  } = req.body;

  if (
    login !== ADMIN_LOGIN ||
    password !== ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: 'Invalid login or password'
    });
  }

  const token = createSession();

  res.json({
    token
  });
});

router.post('/logout', (req, res) => {
  const authHeader =
    req.headers.authorization;

  if (authHeader) {
    const token =
      authHeader.replace('Bearer ', '');

    deleteSession(token);
  }

  res.json({
    message: 'Logged out'
  });
});

module.exports = router;