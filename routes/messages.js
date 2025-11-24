// routes/messages.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // ← ez a mysql2/promise pool!

router.get('/', async (req, res) => {
  try {
    const [messages] = await db.query(`
      SELECT 
        nev, 
        email, 
        varos, 
        kor, 
        uzenet, 
        created_at 
      FROM uzenetek 
      ORDER BY created_at DESC
    `);

    // Átadjuk a template-nek a tömböt + a bejelentkezett felhasználót (ha van)
    res.render('messages', {
      messages: messages || [],
      user: req.session.user || null
    });

  } catch (err) {
    console.error('Hiba az üzenetek lekérdezésekor:', err);
    res.status(500).render('error', {
      message: 'Nem sikerült betölteni az üzeneteket!',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
});

module.exports = router;