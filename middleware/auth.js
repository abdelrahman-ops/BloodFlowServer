import jwt from 'jsonwebtoken';

// Protect routes
export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     token = req.headers.authorization.split(' ')[1];
    // }

    if (!token) {
        return res.status(401).json({
            status: false,
            message: "Unauthorized access. Token is missing. Please log in.",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
            message: `User role ${req.user.role} is not authorized to access this route`
        });
        }
        next();
    };
};