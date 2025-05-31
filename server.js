// server.js

// Load environment variables first
require('dotenv').config();

// --- Dependencies ---
const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // PostgreSQL client
const cors = require('cors'); // For enabling Cross-Origin Resource Sharing

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3001; // Backend server port

// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'newsletter_subscribers',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// --- Database Connection Test ---
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client for DB connection test:', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing test query:', err.stack);
        }
        console.log('Successfully connected to PostgreSQL. Server time:', result.rows[0].now);
    });
});

// --- Routes ---

// Serve the main HTML file at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API Routes ---

/**
 * @route   POST /api/subscribe
 * @desc    Subscribes a new user to the newsletter
 * @access  Public
 */
app.post('/api/subscribe', async (req, res) => {
    const { name, email, ai_topic, linkedin } = req.body;

    // Basic Validation (server-side)
    if (!name || !email || !ai_topic) {
        return res.status(400).json({ message: 'Name, email, and AI topic are required.' });
    }

    // Validate email format (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Optional: Validate LinkedIn URL format if provided
    if (linkedin) {
        try {
            new URL(linkedin);
        } catch (_) {
            return res.status(400).json({ message: 'Invalid LinkedIn URL format.' });
        }
    }

    try {
        // SQL Query to insert data into PostgreSQL
        const insertQuery = `
            INSERT INTO subscribers (name, email, ai_topic, linkedin_url, subscribed_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, email, subscribed_at;
        `;
        const values = [name, email, ai_topic, linkedin || null];
        const result = await pool.query(insertQuery, values);

        console.log('User subscribed:', result.rows[0]);
        res.status(201).json({
            message: 'Successfully subscribed! Welcome to the AI Newsletter.',
            subscriber: result.rows[0]
        });

    } catch (error) {
        console.error('Error during subscription:', error);

        // Check for unique constraint violation (email already exists)
        if (error.code === '23505') {
            if (error.constraint === 'subscribers_email_key') {
                 return res.status(409).json({ message: 'This email address is already subscribed.' });
            }
            return res.status(409).json({ message: 'This entry already exists.' });
        }

        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
});

// Get all subscribers (for testing purposes)
app.get('/api/subscribers', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, ai_topic, linkedin_url, subscribed_at FROM subscribers ORDER BY subscribed_at DESC');
        res.json({
            total: result.rows.length,
            subscribers: result.rows
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ message: 'Error fetching subscribers' });
    }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`AI Newsletter backend server running on http://localhost:${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/subscribe`);
    console.log(`Subscribers endpoint: http://localhost:${PORT}/api/subscribers`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server and DB pool');
    try {
        await pool.end();
        console.log('PostgreSQL pool has been closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing PostgreSQL pool', error);
        process.exit(1);
    }
});
