import jwt from 'jsonwebtoken';

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY || process.env.JWT_SECRET);
    req.id = decoded.userId;
    req.role = decoded.role;
    
    req.user = { _id: decoded.userId, id: decoded.userId, role: decoded.role };

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const role = req.role || req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        message: `Role (${role || 'none'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};
