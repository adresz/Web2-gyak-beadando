// routes/varosok.js
const express = require('express');
const router = express.Router();
const connection = require('../database');

const RECORDS_PER_PAGE = 50;

router.get('/', (req, res) => {
  let tabla = req.query.tabla || 'varos';
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const sort  = req.query.sort || 'id';

  // NORMALIZÁLT ORDER KEZELÉS – EZ JAVÍTJA MEG
  const order = (req.query.order || 'ASC').toUpperCase() === 'DESC'
    ? 'DESC'
    : 'ASC';

  // Csak ezt a három táblát engedjük
  if (!['varos', 'megye', 'lelekszam'].includes(tabla)) {
    tabla = 'varos';
  }

  const offset = (page - 1) * RECORDS_PER_PAGE;

  // Rekordszám
  const countSql = `SELECT COUNT(*) AS total FROM \`${tabla}\``;

  connection.query(countSql, (err, countResult) => {
    if (err) throw err;

    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE);

    // Oldal adatainak lekérése
    const dataSql = `
      SELECT * FROM \`${tabla}\`
      ORDER BY \`${sort}\` ${order}
      LIMIT ? OFFSET ?
    `;

    connection.query(dataSql, [RECORDS_PER_PAGE, offset], (err, adatok) => {
      if (err) throw err;

      res.render('varosok', {
        tabla,
        adatok,
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
    });
  });
});

module.exports = router;
