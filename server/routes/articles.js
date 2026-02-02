const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const requireResearcher = require('../middleware/requireResearcher');
const requireAdmin = require('../middleware/requireAdmin');

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + '_' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF allowed'));
    cb(null, true);
  }
});

// GET /api/articles/latest?limit=10
router.get('/latest', async (req, res) => {
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
  const [rows] = await pool.query('SELECT * FROM articles WHERE status = "approved" ORDER BY created_at DESC LIMIT ?', [limit]);
  res.json({ ok: true, articles: rows });
});

// GET /api/articles/type/:type
router.get('/type/:type', async (req, res) => {
  const { type } = req.params;
  const [rows] = await pool.query('SELECT * FROM articles WHERE type = ? AND status = "approved" ORDER BY created_at DESC', [type]);
  res.json({ ok: true, articles: rows });
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  if (!rows.length || rows[0].status !== 'approved') return res.status(404).json({ ok: false });
  res.json({ ok: true, article: rows[0] });
});

// POST /api/articles (researcher only)
router.post('/', requireResearcher, upload.single('pdf'), async (req, res) => {
  const { type, title, author, school, level, abstract } = req.body;
  if (!req.file) return res.status(400).json({ ok: false, error: 'PDF required' });
  const pdf_filename = req.file.filename;
  const pdf_url = '/uploads/' + pdf_filename;
  await pool.query(
    'INSERT INTO articles (type, title, author, school, level, abstract, pdf_filename, pdf_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [type, title, author, school, level, abstract, pdf_filename, pdf_url, 'pending']
  );
  res.json({ ok: true });
});

// GET /api/articles/pending (admin only)
router.get('/pending', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM articles WHERE status = "pending" ORDER BY created_at ASC');
  res.json({ ok: true, articles: rows });
});

// POST /api/articles/:id/approve (admin only)
router.post('/:id/approve', requireAdmin, async (req, res) => {
  await pool.query('UPDATE articles SET status = "approved" WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/articles/:id/reject (admin only)
router.post('/:id/reject', requireAdmin, async (req, res) => {
  await pool.query('UPDATE articles SET status = "rejected" WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/articles/:id/view
router.post('/:id/view', async (req, res) => {
  await pool.query('INSERT INTO metrics (article_id, views) VALUES (?, 1) ON DUPLICATE KEY UPDATE views = views + 1', [req.params.id]);
  res.json({ ok: true });
});

// POST /api/articles/:id/download
router.post('/:id/download', async (req, res) => {
  await pool.query('INSERT INTO metrics (article_id, downloads) VALUES (?, 1) ON DUPLICATE KEY UPDATE downloads = downloads + 1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
