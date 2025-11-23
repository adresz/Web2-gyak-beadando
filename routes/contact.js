var express = require('express');
var router = express.Router();
const connection = require('../database'); 

// GET kapcsolat oldal
router.get('/', (req, res) => {
  res.render('contact');
});

// POST - mentés az adatbázisba
router.post('/', (req, res) => {
  const { nev, email, varos, kor, uzenet } = req.body;

// Szerveroldali validáció
  if (nev.length < 10) return res.status(400).send("A név minimum 10 karakter!");
  if (uzenet.length < 10) return res.status(400).send("Az üzenet minimum 10 karakter!");
  if (kor < 10) return res.status(400).send("Az életkor minimum 10!");


  const sql = `
    INSERT INTO uzenetek (nev, email, varos, kor, uzenet, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;

  connection.query(sql, [nev, email, varos, kor, uzenet], (err, result) => {
    if (err) {
      console.error("Hiba az üzenet mentésekor:", err);
      return res.status(500).send("Adatbázis hiba történt.");
    }

    res.render('contact-success', { nev });
  });
});

module.exports = router;
