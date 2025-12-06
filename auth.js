const adminPassword = 'DARKX2025';
const appPassword = 'DARKX-OFFICIAL2025';

const authenticateAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.body.password;
  
  if (password === adminPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized access to admin panel' });
  }
};

const authenticateApp = (req, res, next) => {
  const password = req.headers['x-app-password'] || req.body.password;
  
  if (password === appPassword) {
    next();
  } else {
    res.status(403).json({ 
      error: 'Access denied', 
      message: 'Please purchase passcode from owner',
      whatsapp: '255775710774',
      price: 'TSh 1000'
    });
  }
};

module.exports = { authenticateAdmin, authenticateApp };
