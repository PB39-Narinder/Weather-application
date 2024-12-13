const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login route
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.render('auth/login', { error: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Store user in session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.redirect('/');
    } catch (error) {
        res.render('auth/login', { error: 'Login failed' });
    }
});

// Signup route
router.get('/signup', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/signup', { error: null });
});

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            return res.render('auth/signup', { 
                error: 'Username or email already exists' 
            });
        }

        // Create new user
        await User.create({ username, email, password });
        res.redirect('/auth/login');
    } catch (error) {
        res.render('auth/signup', { error: 'Signup failed' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router; 