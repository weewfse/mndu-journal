const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Demo login: admin, researcher, user
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.json({ ok: false, error: 'Missing fields' });

  // Demo admin login
  if (role === 'admin') {
    if (username === 'admin' && password === 'admin123') {
      req.session.user = { id: 0, username: 'admin', role: 'admin' };
      return res.json({ ok: true, user: req.session.user });
    } else {
      return res.json({ ok: false, error: 'Invalid admin credentials' });
    }
  }

  // DB user/researcher login
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.json({ ok: false, error: 'User not found' });
    const user = rows[0];
    // For demo, allow plaintext or bcrypt
    const valid = user.password_hash === password || await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.json({ ok: false, error: 'Invalid password' });
    if (user.role !== role) return res.json({ ok: false, error: 'Role mismatch' });
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ ok: true, user: req.session.user });
  } catch (e) {
    res.json({ ok: false, error: 'DB error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ ok: true, ...req.session.user });
  } else {
    res.json({ ok: false });
  }
});

module.exports = router;
