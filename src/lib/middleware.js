import { verifyToken } from './auth';

/**
 * Higher-order function to wrap API handlers with RBAC.
 * @param {Function} handler - The API route handler
 * @param {string[]} allowedRoles - Array of allowed roles (e.g. ['ADMIN', 'MANAGER'])
 */
export function withAuth(handler, allowedRoles = []) {
    return async (req, res) => {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
        }

        // Attach user to request
        req.user = decoded;

        // Check Role
        if (allowedRoles.length > 0) {
            // Normalize role checking - convert to uppercase for comparison
            const userRole = (decoded.role || '').toUpperCase();
            const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
            
            // Also check for super_owner which has all access
            if (userRole === 'SUPER_OWNER') {
                // Super owner bypasses role checks
            } else if (!normalizedAllowedRoles.includes(userRole)) {
                return res.status(403).json({ success: false, message: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` });
            }
        }

        // Call the original handler
        return handler(req, res);
    };
}
