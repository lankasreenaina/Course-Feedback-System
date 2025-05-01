const passport = require('passport');

exports.authenticateUser = passport.authenticate('jwt', { session: false });

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

exports.isOwnerOrAdmin = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.outletId || req.params.userId);
            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            if (req.user.role === 'admin' || 
                (resource.professor && resource.professor.toString() === req.user.id) || 
                resource._id.toString() === req.user.id) {
                next();
            } else {
                res.status(403).json({ message: 'Not authorized' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    };
}; 