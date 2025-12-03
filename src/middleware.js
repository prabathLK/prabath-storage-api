import { API_KEY } from './config.js';

export const authMiddleware = (req, res, next) => {
  const clientKey = req.headers['x-api-key'] || req.query.apikey;

  if (!clientKey || clientKey !== API_KEY) {
    return res.status(403).json({ 
      status: false, 
      message: 'Access Denied' 
    });
  }
  
  next();
};
