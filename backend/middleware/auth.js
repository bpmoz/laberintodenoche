import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Make sure this runs and loads your .env in the backend

export const auth = (req, res, next) => {
  try {
    console.log("Auth middleware called!");
    console.log(
      "JWT_SECRET:",
      process.env.JWT_SECRET ? "Loaded" : "Not Loaded",
      process.env.JWT_SECRET
        ? process.env.JWT_SECRET.substring(0, 5) + "..."
        : ""
    ); // Check if loaded and maybe first few chars

    const authHeader = req.header("Authorization");
    console.log("Authorization Header:", authHeader); // See the full header

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token or malformed header"); // Log specific reason
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const token = authHeader.substring(7);
    console.log(
      "Token extracted:",
      token ? token.substring(0, 10) + "..." : "Empty"
    ); // Log the token (partially)

    // *** The error likely happens here ***
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded); // See the payload if successful

    req.user = decoded;
    // **Potential consistency check:** Your likes routes use req.user.id, comments POST uses req.user.userId.
    // Make sure the payload decoded from the JWT actually contains a property you intend to use (e.g., '_id', 'id', or 'userId')
    // based on how you signed the token during login. If payload has '_id', you might need req.user._id.
    console.log("Attaching req.user:", req.user);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message); // Log the actual verification error message
    // console.error("Auth middleware error details:", error); // More detailed error
    res.status(401).json({ message: "Token is not valid" }); // Sends 401
  }
};

// ... adminOnly middleware ...

export const adminOnly = (req, res, next) => {
  console.log(req.user);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
