import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
  const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); 
  req.user = decoded; 
  console.log("decode data:", decoded)
  next();
} catch (error) {
  res.status(401).json({ message: "Invalid or expired token" });
}
};



 // jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ message: "Invalid token" });
  //   req.user = user; 

  //   next();
  // });