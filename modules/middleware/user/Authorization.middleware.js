// Authorization.middleware.js
const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ErrorResult = require("../../../helper/error.tool");
const RoleService = require("../../services/user/Role.service");

module.exports = (requiredPermissions = []) => {
    return ErrorBoundary(async (req, reply) => {
        const user = req.user;

        if (!user) {
            throw ErrorResult.unAuthorized();
        }

        // Admin bypass
        if (user.permission === 'admin') {
            return;
        }

        // Get user access list
        const userAccess = await RoleService.getUserAccessList(user);
        req.user.access = userAccess;

        // No specific permissions required
        if (requiredPermissions.length === 0) {
            return;
        }

        // Check if user has any of the required permissions
        const hasAccess = requiredPermissions.some(permission => 
            userAccess.includes(permission)
        );

        if (!hasAccess || userAccess.length === 0) {
            throw ErrorResult.forbidden();
        }
    });
};