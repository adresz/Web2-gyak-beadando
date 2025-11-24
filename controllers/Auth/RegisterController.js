// controllers/Auth/RegisterController.js
const bcrypt = require('bcrypt');
const { connection } = require('../../app'); // <-- ez a kulcs!

class RegisterController {
  create(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { error: null, old: {} });
  }

  async store(req, res) {
    const { name, email, password, password_confirmation } = req.body;

    // Validáció
    const errors = [];
    if (!name || name.length > 255) errors.push('A név kötelező és max. 255 karakter lehet.');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Érvényes email cím kell.');
    if (!password || password.length < 6) errors.push('A jelszónak legalább 6 karakternek kell lennie.');
    if (password !== password_confirmation) errors.push('A jelszavak nem egyeznek.');

    // Egyedi ellenőrzés (ha nincs hiba eddig)
    if (errors.length === 0) {
      try {
        const [nameRows] = await this.query('SELECT id FROM users WHERE name = ?', [name]);
        const [emailRows] = await this.query('SELECT id FROM users WHERE email = ?', [email]);

        if (nameRows.length > 0) errors.push('Ez a név már foglalt.');
        if (emailRows.length > 0) errors.push('Ezzel az email címmel már regisztráltak.');
      } catch (err) {
        console.error('DB hiba az egyediség ellenőrzésnél:', err);
        return res.render('auth/register', { error: 'Szerver hiba, próbáld később.', old: req.body });
      }
    }

    if (errors.length > 0) {
      return res.render('auth/register', { error: errors.join('<br>'), old: req.body });
    }

    // Jelszó hashelés (Laravel Hash::make kompatibilis)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Felhasználó mentése
    connection.query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, 'registered', NOW(), NOW())`,
      [name, email, hashedPassword],
      (err) => {
        if (err) {
          console.error('Regisztrációs hiba:', err);
          return res.render('auth/register', { error: 'Hiba történt a regisztráció során.', old: req.body });
        }
        res.redirect('/login?success=Sikeres regisztráció! Most bejelentkezhetsz.');
      }
    );
  }

  // Segédmetódus a promisify-olt query-hez
  query(sql, params) {
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = new RegisterController();