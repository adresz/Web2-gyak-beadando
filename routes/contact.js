// routes/contact.js – TELJESEN ÁTÍRVA async/await-re (mysql2/promise)
const express = require('express');
const router = express.Router();
const db = require('../database'); // ← ez a mysql2/promise pool!

// GET – kapcsolat oldal megjelenítése
router.get('/', (req, res) => {
  res.render('contact');
});

// POST – üzenet mentése
router.post('/', async (req, res) => {
  const { nev, email, varos, kor, uzenet } = req.body;

  // Szerveroldali validáció (ugyanaz, mint eddig)
  if (!nev || nev.trim().length < 10) {
    return res.status(400).render('contact', { 
      error: 'A név minimum 10 karakter kell legyen!' 
    });
  }
  if (!uzenet || uzenet.trim().length < 10) {
    return res.status(400).render('contact', { 
      error: 'Az üzenet minimum 10 karakter kell legyen!' 
    });
  }
  if (!kor || parseInt(kor) < 10) {
    return res.status(400).render('contact', { 
      error: 'Az életkor minimum 10 év kell legyen!' 
    });
  }

  try {
    await db.query(
      `INSERT INTO uzenetek 
       (nev, email, varos, kor, uzenet, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [nev.trim(), email?.trim() || null, varos?.trim() || null, parseInt(kor), uzenet.trim()]
    );

    // SIKERES mentés → sikeroldal
    res.render('contact-success', { nev: nev.trim() });

  } catch (err) {
    console.error('Hiba az üzenet mentésekor:', err);
    res.status(500).render('contact', {
      error: 'Hiba történt az üzenet küldésekor. Próbáld újra később!'
    });
  }
});

module.exports = router;