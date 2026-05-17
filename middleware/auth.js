// Checking if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Checking if user is admin
function isAdmin(req, res, next) {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  res.status(403).send('Access denied. Admin only.');
}

// Making user data available to all views
function setUserLocals(req, res, next) {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
    role: req.session.userRole
  } : null;
  next();
}

module.exports = { isAuthenticated, isAdmin, setUserLocals };
