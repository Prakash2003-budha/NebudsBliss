import { AppConfig, UserRole } from "../config/constants.js";
import jwt from "jsonwebtoken";
import autSvc from "../modules/auth/auth.service.js";

const normalizeRoles = (roles) => {
    // Accept either a string ("Admin"), an array (["Admin", "Staff"]), or null.
    if (!roles) return null;
    return Array.isArray(roles) ? roles : [roles];
};

const allowUser = (roles = null) => {
    // Support BOTH legacy usage (allowUser(), allowUser("Admin")) and the newer
    // options object: allowUser({ optional: true }) or allowUser({ roles: "Admin" }).
    let allowedRoles = null;
    let optional = false;
    if (roles && typeof roles === "object" && !Array.isArray(roles) && !(roles instanceof String)) {
        allowedRoles = normalizeRoles(roles.roles ?? null);
        optional = !!roles.optional;
    } else {
        allowedRoles = normalizeRoles(roles);
    }

    return async (req, res, next) => {
        try {
            let token = req.headers['authorization'] || null;
            if (!token) {
                // When the route is optional (guest checkout), continue without a user.
                if (optional) {
                    req.authUser = null;
                    return next();
                }
                // Return immediately out of the middleware execution if token is missing
                return next({
                    code: 401,
                    message: "Login token required. Unauthenticated.",
                    status: "UNAUTHENTICATED"
                });
            }

            token = token.split(" ").pop();

            // jwt.verify will jump straight to the catch() block below if the token is expired or corrupt
            let payload = jwt.verify(token, AppConfig.jwtSecret);
            
            if (payload.type === "access") {
                const user = await autSvc.getSingleUserByFilter({
                    _id: payload.sub
                });

                if (!user) {
                    return next({
                        code: 401,
                        message: "User account context not found",
                        status: "UNAUTHENTICATED"
                    });
                }

                // Attach full user details to the request lifecycle object
                req.authUser = autSvc.publicUserProfile(user);

                // Check authorization tiers (Admin bypasses checks, otherwise inspect assigned roles array)
                if (!allowedRoles || user.role === UserRole.ADMIN || allowedRoles.includes(user.role)) {
                    return next();
                } else {
                    return next({
                        code: 403,
                        message: "Access Denied. You do not have permission to view this resource.",
                        status: "UNAUTHORIZED"
                    });
                }
            } else {
                return next({
                    code: 401,
                    message: "Invalid Token type sequence provided.",
                    status: "UNAUTHENTICATED"
                });
            }
        } catch (exception) {
            // Check if the validation failure is due to temporal token expiration
            if (exception.name === "TokenExpiredError") {
                return next({
                    code: 401,
                    message: "Your login session has expired. Please log in again.",
                    status: "JWT_EXPIRED" // Picked up by frontend interceptor to log out user
                });
            }

            // Fallback for general cryptographic error signatures (tampered tokens, wrong secret keys)
            return next({
                code: 401,
                message: exception.message || "Session verification failed.",
                status: "UNAUTHENTICATED"
            });
        }
    };
};

export default allowUser;