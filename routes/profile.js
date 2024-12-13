const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get edit profile page
router.get('/edit', auth, (req, res) => {
    res.render('profile/edit', {
        user: req.session.user,
        error: null,
        success: null
    });
});

// Update profile
router.post('/edit', auth, async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.session.user.id);

        // Check if username or email is already taken by another user
        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: user._id } }, // Exclude current user
                { $or: [
                    { username: username.toLowerCase() },
                    { email: email.toLowerCase() }
                ]}
            ]
        });

        if (existingUser) {
            return res.render('profile/edit', {
                user: req.session.user,
                error: existingUser.username === username.toLowerCase() 
                    ? 'Username is already taken' 
                    : 'Email is already registered',
                success: null
            });
        }

        // Validate current password if trying to change password
        if (newPassword) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.render('profile/edit', {
                    user: req.session.user,
                    error: 'Current password is incorrect',
                    success: null
                });
            }
        }

        // Update user information
        user.username = username.toLowerCase();
        user.email = email.toLowerCase();

        // Update password if provided
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        // Update session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.render('profile/edit', {
            user: req.session.user,
            error: null,
            success: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Profile update error:', error);
        let errorMessage = 'Failed to update profile';
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            if (error.keyPattern.username) {
                errorMessage = 'Username is already taken';
            } else if (error.keyPattern.email) {
                errorMessage = 'Email is already registered';
            }
        }

        res.render('profile/edit', {
            user: req.session.user,
            error: errorMessage,
            success: null
        });
    }
});

module.exports = router; 