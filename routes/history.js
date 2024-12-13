const express = require('express');
const router = express.Router();
const Weather = require('../models/Weather');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const history = await Weather.find({ user: req.session.user.id })
            .sort({ date: -1 })
            .limit(20); // Show last 20 searches

        res.render('history', { history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.render('history', { 
            history: [],
            error: 'Failed to load search history'
        });
    }
});

module.exports = router; 