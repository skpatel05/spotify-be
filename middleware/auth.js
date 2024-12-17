const jwt = require("jsonwebtoken"); 

module.exports = (req, res, next) => {
  // Extract token from the Authorization header
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token from "Bearer <token>"
  console.log(token, "token from headers")
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "No token, authorization denied" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user info to request object
    next(); // Token is valid, proceed to the next middleware
  } catch (err) {
    res.status(401).json({ status: "error", message: "Token is not valid" });
  }
};
