import express from 'express'; // 'json' is a method on the express app instance, not a named export here
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Needed for __dirname in ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5501;

// Middleware
app.use(cors());
app.use(express.json()); // Use express.json() here

// Database setup
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            location TEXT NOT NULL,
            job_type TEXT NOT NULL,
            salary_min REAL,
            salary_max REAL,
            job_description TEXT NOT NULL,
            application_deadline TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating jobs table', err.message);
            }
        });
    }
});

// --- API Endpoints ---

// POST /api/jobs - Create a new job
app.post('/api/jobs', (req, res) => {
    const {
        job_title,
        company_name,
        location,
        job_type,
        salary_min,
        salary_max,
        job_description,
        application_deadline
    } = req.body;

    // Basic validation for mandatory fields
    const missingFields = [];
    if (!job_title) missingFields.push('job_title');
    if (!company_name) missingFields.push('company_name');
    if (!location) missingFields.push('location');
    if (!job_type) missingFields.push('job_type');
    if (salary_min === undefined || salary_min === null) missingFields.push('salary_min'); // Assuming 0 is a valid min salary
    if (salary_max === undefined || salary_max === null) missingFields.push('salary_max'); // Assuming 0 is a valid max salary
    if (!job_description) missingFields.push('job_description');
    if (!application_deadline) missingFields.push('application_deadline');

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing mandatory fields: ${missingFields.join(', ')}` });
    }

    const sql = `INSERT INTO jobs (job_title, company_name, location, job_type, salary_min, salary_max, job_description, application_deadline)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [job_title, company_name, location, job_type, salary_min, salary_max, job_description, application_deadline];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error inserting job:', err.message);
            return res.status(500).json({ message: 'Failed to create job posting.', error: err.message });
        }
        res.status(201).json({ message: 'Job created successfully', id: this.lastID, ...req.body });
    });
});

// GET /api/jobs - Get all jobs with filtering
app.get('/api/jobs', (req, res) => {
    const { job_type, location, keywords } = req.query;
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (job_type) {
        sql += ' AND job_type = ?';
        params.push(job_type);
    }
    if (location) {
        sql += ' AND location = ?';
        params.push(location);
    }
    if (keywords) {
        sql += ' AND job_title LIKE ?'; // Only searching in job_title as per your confirmation
        params.push(`%${keywords}%`);
    }

    sql += ' ORDER BY created_at DESC'; // Optional: order by newest first

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching jobs:', err.message);
            return res.status(500).json({ message: 'Failed to retrieve jobs.', error: err.message });
        }
        res.json(rows); // This sends the array of jobs (which could be empty)
    });
});

// GET /api/jobs/:id - Get a single job by ID (Optional, but good practice)
app.get('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM jobs WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Error fetching job by ID:', err.message);
            return res.status(500).json({ message: 'Failed to retrieve job.', error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Job not found.' });
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});