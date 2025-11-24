// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  // Csak admin férhet hozzá
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }

  try {
    const [users] = await db.query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.render('admin', { 
      users: users,
      user: req.session.user 
    });

  } catch (err) {
    console.error('Admin hiba:', err);
    res.status(500).send('Adatbázis hiba');
  }
});

module.exports = router;