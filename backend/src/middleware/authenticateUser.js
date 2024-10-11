import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    console.error("Authorization header missing");
    return res
      .status(401)
      .json({ message: "No authorization header provided" });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    console.error("Token missing");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || Date.now() >= decoded.exp * 1000) {
      console.error("Token expired or invalid");
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    console.log("User authenticated:", req.user);
    next();
  } catch (err) {
    console.error("Error in token verification:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};
