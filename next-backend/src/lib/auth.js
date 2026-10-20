import jwt from "jsonwebtoken";

/**
 * Direct JWT token string verifier used by src/proxy.js
 */
export function verifyJWT(token) {
  try {
    const secret = process.env.JWT_SECRET || "super_secret_exam_key_2026";
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Request cookie & header verifier used by API routes
 */
export function verifyToken(req) {
  try {
    let token;

    // 1. Read from NextRequest cookies
    if (req?.cookies?.get) {
      token = req.cookies.get("token")?.value;
    }

    // 2. Fallback to standard cookie header
    if (!token && req?.headers) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) token = match[1];
    }

    // 3. Fallback to Authorization header
    if (!token && req?.headers) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return { error: "Unauthorized: No token provided", status: 401 };
    }

    const secret = process.env.JWT_SECRET || "super_secret_exam_key_2026";
    const decoded = jwt.verify(token, secret);

    return { user: decoded };
  } catch (error) {
    return { error: "Unauthorized: Invalid or expired token", status: 401 };
  }
}
