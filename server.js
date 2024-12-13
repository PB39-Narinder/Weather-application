require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const axios = require('axios');
const auth = require('./middleware/auth');
const Weather = require('./models/Weather');

const app = express();

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Make user data available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.path = req.path;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const favoriteRoutes = require('./routes/favorites');
const profileRoutes = require('./routes/profile');
const historyRoutes = require('./routes/history');

app.use('/auth', authRoutes);
app.use('/weather', weatherRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/profile', profileRoutes);
app.use('/history', historyRoutes);

// Home route
app.get('/', async (req, res) => {
    try {
        let recentSearches = [];
        if (req.session.user) {
            recentSearches = await Weather.find({ user: req.session.user.id })
                .sort({ date: -1 })
                .limit(5);
        }
        
        res.render('index', { 
            recentSearches,
            path: '/'
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('index', { 
            recentSearches: [],
            path: '/'
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: {},
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
}); 