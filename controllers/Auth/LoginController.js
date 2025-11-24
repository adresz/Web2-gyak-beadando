// controllers/Auth/LoginController.js
const bcrypt = require('bcrypt');
const db = require('../../database'); // mysql2/promise pool

class LoginController {
  // GET /login – bejelentkezési űrlap
  create(req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }
    res.render('auth/login', { error: null });
  }

  // POST /login – beléptetés
  async store(req, res) {
    const { email, password } = req.body;

    // Alap validáció
    if (!email || !password) {
      return res.render('auth/login', {
        error: 'Az e-mail cím és a jelszó megadása kötelező!'
      });
    }

    try {
      // 1. Felhasználó keresése
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email.toLowerCase().trim()]
      );

      // 2. Van-e ilyen user + jó-e a jelszó?
      if (rows.length === 0) {
        return res.render('auth/login', { error: 'Hibás e-mail vagy jelszó!' });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.render('auth/login', { error: 'Hibás e-mail vagy jelszó!' });
      }

      // 3. Sikeres belépés → session beállítása
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'registered'
      };

      // 4. Vissza a kívánt oldalra (pl. ha védett oldalról jött)
      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;

      // 5. Session mentése, UTÁNA redirect → CSAK EGYETLEN redirect!
      req.session.save((err) => {
        if (err) {
          console.error('Session mentési hiba:', err);
          return res.render('auth/login', { error: 'Bejelentkezési hiba, próbáld újra!' });
        }
        res.redirect(redirectTo);
      });

    } catch (err) {
      console.error('Login hiba:', err);
      res.render('auth/login', { error: 'Szerver hiba, próbáld újra később!' });
    }
  }
}

module.exports = new LoginController();