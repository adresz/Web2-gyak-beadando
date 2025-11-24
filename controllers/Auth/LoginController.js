// controllers/Auth/LoginController.js
const bcrypt = require('bcrypt');
const { connection } = require('../../app');

class LoginController {
  create(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { error: null });
  }

  async store(req, res) {
    const { email, password } = req.body;

    try {
      const results = await this.query('SELECT * FROM users WHERE email = ?', [email]);
      if (results.length === 0) {
        return res.render('auth/login', { error: 'Hibás e-mail vagy jelszó!' });
      }

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.render('auth/login', { error: 'Hibás e-mail vagy jelszó!' });
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'registered'
      };

      const redirectTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      res.redirect(redirectTo);

    } catch (err) {
      console.error(err);
      res.render('auth/login', { error: 'Szerver hiba, próbáld később!' });
    }
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      connection.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}

module.exports = new LoginController();