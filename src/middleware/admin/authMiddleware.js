import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const adminauthenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
  const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); 
  req.admin = decoded; 
  next();
} catch (error) {
  res.status(401).json({ message: "Invalid or expired token" });
}
};
