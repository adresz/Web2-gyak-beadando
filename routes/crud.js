var express = require('express');
var router = express.Router();
const connection = require('../database');

// READ – lista megjelenítése 
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM varos ORDER BY id ASC';
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).send('Adatbázis hiba!');
    res.render('crud-list', { records: results });
  });
});

// CREATE – új rekord 
router.get('/create', (req, res) => {
  const sql = 'SELECT id, nev FROM megye ORDER BY nev ASC';
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).send('Adatbázis hiba a megyék lekérdezésekor!');
    res.render('crud-create', { megyek: results });
  });
});

// CREATE – új rekord mentése 
router.post('/create', (req, res) => {
  let { id, nev, megyeid, megyeszekhely, megyeijogu } = req.body;

  id = parseInt(id);
  megyeid = parseInt(megyeid);
  megyeszekhely = parseInt(megyeszekhely);
  megyeijogu = parseInt(megyeijogu);

  const sql = `
    INSERT INTO varos (id, nev, megyeid, megyeszekhely, megyeijogu, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;
  connection.query(sql, [id, nev, megyeid, megyeszekhely, megyeijogu], (err) => {
    if (err) {
      console.error("CREATE hiba:", err);
      return res.status(500).send("Adatbázis hiba!");
    }
    res.redirect('/crud');
  });
});

// UPDATE – szerkesztés
router.get('/edit/:id', (req, res) => {
  const id = req.params.id;
  const sql1 = 'SELECT * FROM varos WHERE id = ?';
  const sql2 = 'SELECT id, nev FROM megye ORDER BY nev ASC';

  connection.query(sql1, [id], (err, results) => {
    if (err) return res.status(500).send('Adatbázis hiba!');
    if (results.length === 0) return res.status(404).send('Rekord nem található');

    connection.query(sql2, (err2, megyek) => {
      if (err2) return res.status(500).send('Adatbázis hiba a megyék lekérdezésekor!');
      res.render('crud-edit', { record: results[0], megyek });
    });
  });
});

// UPDATE – módosítás mentése
router.post('/edit/:id', (req, res) => {
  const id = req.params.id;
  let { nev, megyeid, megyeszekhely, megyeijogu } = req.body;

  megyeid = parseInt(megyeid);
  megyeszekhely = parseInt(megyeszekhely);
  megyeijogu = parseInt(megyeijogu);

  const sql = `
    UPDATE varos
    SET nev=?, megyeid=?, megyeszekhely=?, megyeijogu=?, updated_at=NOW()
    WHERE id=?
  `;
  connection.query(sql, [nev, megyeid, megyeszekhely, megyeijogu, id], (err) => {
    if (err) return res.status(500).send('Adatbázis hiba!');
    res.redirect('/crud');
  });
});

// DELETE – rekord törlése
router.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM varos WHERE id = ?';
  connection.query(sql, [id], (err) => {
    if (err) return res.status(500).send('Adatbázis hiba!');
    res.redirect('/crud');
  });
});

module.exports = router;
