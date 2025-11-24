// controllers/Auth/RegisterController.js
const bcrypt = require('bcrypt');
const db = require('../../database'); // ← ez a helyes! (a database.js fájl)

// Promisify-oljuk a connection-t egyszer, hogy await-elhessük
const util = require('util');
const query = util.promisify(db.query).bind(db);

class RegisterController {
  create(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { error: null, old: {} });
  }

  async store(req, res) {
    const { name, email, password, password_confirmation } = req.body;

    // 1. Validáció
    const errors = [];
    if (!name || name.trim().length === 0 || name.length > 255)
      errors.push('A név kötelező és max. 255 karakter lehet.');
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      errors.push('Érvényes email cím szükséges.');
    if (!password || password.length < 6)
      errors.push('A jelszónak legalább 6 karakternek kell lennie.');
    if (password !== password_confirmation)
      errors.push('A jelszavak nem egyeznek.');

    // 2. Egyediség ellenőrzés (csak ha nincs validációs hiba)
    if (errors.length === 0) {
      try {
        const nameRows = await query('SELECT id FROM users WHERE name = ?', [name.trim()]);
        const emailRows = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);

        if (nameRows.length > 0) errors.push('Ez a név már foglalt.');
        if (emailRows.length > 0) errors.push('Ezzel az email címmel már regisztráltak.');
      } catch (err) {
        console.error('Adatbázis hiba az egyediség ellenőrzésnél:', err);
        return res.render('auth/register', {
          error: 'Szerver hiba, próbáld újra később.',
          old: req.body
        });
      }
    }

    // 3. Ha van hiba → vissza a formra
    if (errors.length > 0) {
      return res.render('auth/register', {
        error: errors.join('<br>'),
        old: req.body
      });
    }

    // 4. Jelszó hashelés + mentés
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await query(
        `INSERT INTO users (name, email, password, role, created_at, updated_at) 
         VALUES (?, ?, ?, 'registered', NOW(), NOW())`,
        [name.trim(), email.toLowerCase(), hashedPassword]
      );

      res.redirect('/login?success=Sikeres+regisztráció!+Most+bejelentkezhetsz.');
    } catch (err) {
      console.error('Hiba a regisztráció mentésekor:', err);
      res.render('auth/register', {
        error: 'Hiba történt a regisztráció során. Próbáld újra.',
        old: req.body
      });
    }
  }
}

module.exports = new RegisterController();