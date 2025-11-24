// middleware/requireAuthAndRole.js
function requireAuthAndRole(allowedRoles = []) {
    return (req, res, next) => {
        // 1. Check if user is logged in
        if (!req.session || !req.session.user) {
            req.session.returnTo = req.originalUrl; // optional: remember where they were going
            return res.redirect('/login');
        }

        const userRole = req.session.user.role;

        // 2. Check if user's role is allowed
        if (!userRole || !allowedRoles.includes(userRole)) {
            // Option A: Render forbidden page
            return res.status(403).render('error', {
                message: 'Nincs jogosultságod az oldal megtekintéséhez.',
                error: { status: 403 }
            });

            // Option B: Or just redirect (uncomment if you prefer)
            // return res.redirect('/unauthorized');
        }

        // User is authenticated and has correct role
        next();
    };
}

module.exports = requireAuthAndRole;