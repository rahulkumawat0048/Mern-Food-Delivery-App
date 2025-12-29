import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token verification failed" });
    }

    req.userId = decoded.id; // ✅ match the payload you used in token creation
    next();
  } catch (error) {
    console.error("isAuth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
