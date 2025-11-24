// routes/crud.js – TELJESEN ÁTÍRVA async/await-re (mysql2/promise)
const express = require('express');
const router = express.Router();
const db = require('../database'); // ← ez a promise pool!

// LISTA – minden város megjelenítése
router.get('/', async (req, res) => {
  try {
    const [records] = await db.query('SELECT * FROM varos ORDER BY id ASC');
    res.render('crud-list', { records });
  } catch (err) {
    console.error('CRUD lista hiba:', err);
    res.status(500).send('Adatbázis hiba a városok betöltésekor!');
  }
});

// CREATE – új város űrlap
router.get('/create', async (req, res) => {
  try {
    const [megyek] = await db.query('SELECT id, nev FROM megye ORDER BY nev ASC');
    res.render('crud-create', { megyek });
  } catch (err) {
    console.error('Megye lekérdezés hiba:', err);
    res.status(500).send('Nem sikerült betölteni a megyéket!');
  }
});

// CREATE – új város mentése
router.post('/create', async (req, res) => {
  let { id, nev, megyeid, megyeszekhely, megyeijogu } = req.body;

  // Biztonságos konvertálás
  id = parseInt(id) || null;
  megyeid = parseInt(megyeid) || 0;
  megyeszekhely = parseInt(megyeszekhely) || 0;
  megyeijogu = parseInt(megyeijogu) || 0;

  try {
    await db.query(
      `INSERT INTO varos 
       (id, nev, megyeid, megyeszekhely, megyeijogu, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, nev, megyeid, megyeszekhely, megyeijogu]
    );
    res.redirect('/crud');
  } catch (err) {
    console.error('Város létrehozása sikertelen:', err);
    res.status(500).send('Nem sikerült létrehozni a várost! (Lehet, hogy az ID már létezik?)');
  }
});

// EDIT – szerkesztési űrlap
router.get('/edit/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [[record]] = await db.query('SELECT * FROM varos WHERE id = ?', [id]);
    const [megyek] = await db.query('SELECT id, nev FROM megye ORDER BY nev ASC');

    if (!record) {
      return res.status(404).send('A keresett város nem létezik!');
    }

    res.render('crud-edit', { record, megyek });
  } catch (err) {
    console.error('Szerkesztés oldal hiba:', err);
    res.status(500).send('Adatbázis hiba');
  }
});

// EDIT – módosítás mentése
router.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  let { nev, megyeid, megyeszekhely, megyeijogu } = req.body;

  megyeid = parseInt(megyeid) || 0;
  megyeszekhely = parseInt(megyeszekhely) || 0;
  megyeijogu = parseInt(megyeijogu) || 0;

  try {
    const result = await db.query(
      `UPDATE varos 
       SET nev = ?, megyeid = ?, megyeszekhely = ?, megyeijogu = ?, updated_at = NOW() 
       WHERE id = ?`,
      [nev, megyeid, megyeszekhely, megyeijogu, id]
    );

    // Ha nem módosult semmi → valószínűleg rossz ID
    if (result[0].affectedRows === 0) {
      return res.status(404).send('Nincs ilyen város!');
    }

    res.redirect('/crud');
  } catch (err) {
    console.error('Frissítés hiba:', err);
    res.status(500).send('Nem sikerült frissíteni a várost!');
  }
});

// DELETE – város törlése (GET vagy POST, ahogy neked kényelmes)
router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query('DELETE FROM varos WHERE id = ?', [id]);
    
    if (result[0].affectedRows === 0) {
      return res.status(404).send('Nincs ilyen város!');
    }

    res.redirect('/crud');
  } catch (err) {
    console.error('Törlés hiba:', err);
    res.status(500).send('Nem lehet törölni ezt a várost! (Lehet, hogy más tábla hivatkozik rá)');
  }
});

module.exports = router;