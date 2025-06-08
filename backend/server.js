import express from 'express'; // 'json' is a method on the express app instance, not a named export here
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Needed for __dirname in ES modules
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const HOST = '0.0.0.0'; 

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
        job_title, // Changed from title to job_title to match db
        company_name, // Changed from company to company_name
        location,
        job_type, // Changed from type to job_type
        salary_min,
        salary_max,
        job_description, // Changed from description to job_description
        application_deadline
    } = req.body;

    // Basic validation for mandatory fields
    const missingFields = [];
    if (!job_title) missingFields.push('job_title');
    if (!company_name) missingFields.push('company_name');
    if (!location) missingFields.push('location');
    if (!job_type) missingFields.push('job_type');
    // Assuming 0 is a valid salary, so check for undefined/null
    if (salary_min === undefined || salary_min === null) missingFields.push('salary_min'); 
    if (salary_max === undefined || salary_max === null) missingFields.push('salary_max'); 
    if (!job_description) missingFields.push('job_description');
    if (!application_deadline) missingFields.push('application_deadline');

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing mandatory fields: ${missingFields.join(', ')}` });
    }

    const sqlInsert = `INSERT INTO jobs (job_title, company_name, location, job_type, salary_min, salary_max, job_description, application_deadline)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const paramsInsert = [job_title, company_name, location, job_type, salary_min, salary_max, job_description, application_deadline];

    db.run(sqlInsert, paramsInsert, function(err) {
        if (err) {
            console.error('Error inserting job:', err.message);
            return res.status(500).json({ message: 'Failed to create job posting.', error: err.message });
        }
        // After successful insertion, fetch the newly created job
        const newJobId = this.lastID;
        const sqlSelect = 'SELECT * FROM jobs WHERE id = ?';
        db.get(sqlSelect, [newJobId], (selectErr, newJob) => {
            if (selectErr) {
                console.error('Error fetching newly created job:', selectErr.message);
                // Still return 201 as the job was created, but indicate data retrieval issue
                return res.status(201).json({ 
                    message: 'Job created successfully, but failed to retrieve complete job data.', 
                    id: newJobId, 
                    ...req.body // Fallback to sending original request body
                });
            }
            if (newJob) {
                res.status(201).json(newJob); // Send the complete new job object
            } else {
                // This case should ideally not happen if insert was successful
                console.error('Failed to find newly created job with ID:', newJobId);
                return res.status(500).json({ message: 'Job created, but encountered an error retrieving it.'});
            }
        });
    });
});

// GET /api/jobs - Get all jobs with filtering
app.get('/api/jobs', (req, res) => {
    const { job_type, location, keywords, salary_min, salary_max } = req.query;
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
        // Assuming keywords search in job_title, company_name, or job_description
        // Adjust the fields as necessary
        sql += ' AND (job_title LIKE ? OR company_name LIKE ? OR job_description LIKE ?)';
        const keywordParam = `%${keywords}%`;
        params.push(keywordParam, keywordParam, keywordParam);
    }
    if (salary_min) {
        sql += ' AND salary_max >= ?'; // Jobs where its max salary is at least the desired min
        params.push(parseFloat(salary_min));
    }
    if (salary_max) {
        sql += ' AND salary_min <= ?'; // Jobs where its min salary is at most the desired max
        params.push(parseFloat(salary_max));
    }

    sql += ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching jobs:', err.message);
            return res.status(500).json({ message: 'Failed to retrieve jobs.', error: err.message });
        }
        res.json(rows);
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
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});
