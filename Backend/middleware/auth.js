import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  // Skip authentication for Swagger documentation
  if (
    req.path.startsWith('/api-docs') ||
    req.path.includes('swagger-ui') ||
    req.path.endsWith('.json') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.js')
  ) {
    return next();
  }
  
  const token =
    req.header("x-auth-token") ||
    req.header("authorization")?.replace("Bearer ", "");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. No token provided.", status:"error" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY || process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next();
  } catch (ex) {
    res.status(401).json({ message: "Invalid token.", status:"error" });
  }
}
export default authenticate;
