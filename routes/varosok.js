// routes/varosok.js – TELJESEN ÁTÍRVA async/await-re (mysql2/promise)
const express = require('express');
const router = express.Router();
const db = require('../database'); // ← ez a mysql2/promise pool!

const RECORDS_PER_PAGE = 50;

router.get('/', async (req, res) => {
  let tabla = req.query.tabla || 'varos';
  let page = Math.max(1, parseInt(req.query.page) || 1);
  let sort = req.query.sort || 'id';

  // Biztonságos order (ASC vagy DESC)
  const order = (req.query.order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  // Csak engedélyezett táblák
  const allowedTables = ['varos', 'megye', 'lelekszam'];
  if (!allowedTables.includes(tabla)) {
    tabla = 'varos';
  }

  const offset = (page - 1) * RECORDS_PER_PAGE;

  try {
    // 1. Összes rekord számolása
    const [[countResult]] = await db.query(`SELECT COUNT(*) AS total FROM \`${tabla}\``);
    const totalRecords = countResult.total;
    const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);

    // 2. Adatok lekérése (pagináció + rendezés)
    const [adatok] = await db.query(
      `SELECT * FROM \`${tabla}\` 
       ORDER BY \`${sort}\` ${order} 
       LIMIT ? OFFSET ?`,
      [RECORDS_PER_PAGE, offset]
    );

    // 3. Renderelés
    res.render('varosok', {
      tabla,
      adatok: adatok || [],
      page,
      totalPages,
      totalRecords,
      sort,
      order,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1
    });

  } catch (err) {
    console.error('Hiba a városok/megyék lekérdezésekor:', err);
    res.status(500).render('error', {
      message: 'Adatbázis hiba történt az adatok betöltésekor!'
    });
  }
});

module.exports = router;