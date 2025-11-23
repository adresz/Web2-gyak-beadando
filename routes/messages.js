var express = require('express');
var router = express.Router();
const connection = require('../database');

// GET /messages – üzenetek listája (mindenki láthatja még)
router.get('/', (req, res) => {
  const sql = `
    SELECT nev, email, varos, kor, uzenet, created_at
    FROM uzenetek
    ORDER BY created_at DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Hiba az üzenetek lekérésekor:", err);
      return res.status(500).send("Adatbázis hiba történt.");
    }

    res.render('messages', { messages: results });
  });
});

module.exports = router;
