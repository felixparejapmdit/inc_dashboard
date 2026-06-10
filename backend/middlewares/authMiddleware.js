const jwt = require("jsonwebtoken");

const isPublicEnrollmentRoute = (req) => {
  const method = req.method;
  const path = req.path;

  // 1. Metadata / reference tables: Allow GET only
  if (method === "GET") {
    const publicGetPrefixes = [
      "/api/languages",
      "/api/citizenships",
      "/api/nationalities",
      "/api/departments",
      "/api/sections",
      "/api/subsections",
      "/api/designations",
      "/api/districts",
      "/api/contact-type-info",
      "/api/government-issued-ids",
      "/api/phonelocations",
      "/api/phone-directory",
      "/api/personnels_check",
      "/api/get-personnel-contacts",
      "/api/get-user-credentials",
      "/api/all-congregations",
    ];
    if (publicGetPrefixes.some(p => path === p || path.startsWith(p + "/"))) {
      return true;
    }
  }

  // 2. Enrollment transactional APIs: Allow GET, POST, PUT, DELETE
  if (path === "/api/personnels" && method === "POST") {
    return true;
  }
  const personnelIdRegex = /^\/api\/personnels\/\d+$/;
  if (personnelIdRegex.test(path) && ["GET", "PUT", "DELETE"].includes(method)) {
    return true;
  }

  // Church duties
  if (path.startsWith("/api/church-duties/") && method === "GET") {
    return true;
  }
  if (path === "/api/personnel_church_duties" && method === "POST") {
    return true;
  }
  if (path.startsWith("/api/personnel_church_duties/") && ["PUT", "DELETE"].includes(method)) {
    return true;
  }

  // Transactional sub-resources
  const transactionalPrefixes = [
    "/api/personnel-contacts",
    "/api/personnel-addresses",
    "/api/personnel-gov-ids",
    "/api/educational-backgrounds",
    "/api/educational-background",
    "/api/work-experiences",
    "/api/work-experience",
    "/api/family-members",
    "/api/get-family-members",
  ];

  for (const prefix of transactionalPrefixes) {
    if (path === prefix && ["GET", "POST"].includes(method)) {
      return true;
    }
    if (path.startsWith(prefix + "/") && ["GET", "PUT", "DELETE"].includes(method)) {
      return true;
    }
  }

  // Upload/remove certificates & update progress
  if (path === "/api/upload-certificates" && method === "POST") {
    return true;
  }
  if (path === "/api/remove-certificate" && method === "PUT") {
    return true;
  }
  if (path === "/api/users/update-progress" && method === "PUT") {
    return true;
  }

  return false;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    if (token !== "null" && token !== "undefined" && token !== "") {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
      } catch (error) {
        if (isPublicEnrollmentRoute(req)) {
          return next();
        }
        return res.status(401).json({ message: "Token is not valid" });
      }
    }
  }

  if (isPublicEnrollmentRoute(req)) {
    return next();
  }

  return res.status(401).json({ message: "No token, authorization denied" });
};

module.exports = verifyToken;

