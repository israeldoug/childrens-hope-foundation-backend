require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize PostgreSQL Database Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
        ? { rejectUnauthorized: false }
        : false
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');

        // Create tables if they don't exist
        const initQueries = `
            CREATE TABLE IF NOT EXISTS donations (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL,
                amount REAL NOT NULL,
                goal TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS newsletter (
                id SERIAL PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        client.query(initQueries, (err, result) => {
            release();
            if (err) console.error('Error creating tables', err.stack);
        });
    }
});

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API Endpoints

// Handle Donation submission
app.post('/api/donations', (req, res) => {
    const { email, amount, goal } = req.body;

    if (!email || !amount) {
        return res.status(400).json({ error: 'Email and amount are required' });
    }

    const sql = 'INSERT INTO donations (email, amount, goal) VALUES ($1, $2, $3) RETURNING id';
    pool.query(sql, [email, amount, goal], async (err, result) => {
        if (err) {
            console.error(err.stack);
            return res.status(500).json({ error: 'Failed to record donation' });
        }

        const insertedId = result.rows[0].id;

        const formattedAmount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Send Thank You Email
        const mailOptions = {
            from: `"Children's Hope Foundation" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Receipt for Your Donation - Children\'s Hope Foundation',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9; }
                        .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px; }
                        .header { background-color: #0c1a4b; color: #ffffff; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
                        .body-content { padding: 40px 30px; }
                        .body-content h2 { color: #0c1a4b; font-size: 20px; margin-top: 0; }
                        .receipt-box { border: 1px solid #e0e0e0; border-radius: 6px; padding: 20px; margin: 25px 0; background-color: #fbfbfb; }
                        .receipt-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
                        .receipt-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
                        .receipt-label { font-weight: 600; color: #555555; }
                        .receipt-value { color: #333333; font-weight: bold; }
                        .impact-text { font-style: italic; color: #555555; background-color: #ebf5ff; padding: 15px; border-left: 4px solid #2a7ae4; margin: 25px 0; border-radius: 4px; }
                        .footer { background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 13px; color: #777777; }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="header">
                            <h1>Children's Hope Foundation</h1>
                        </div>
                        <div class="body-content">
                            <h2>Thank You for Your Generosity</h2>
                            <p>Dear Supporter,</p>
                            <p>On behalf of the entire team at Children's Hope Foundation, we are writing to express our deepest gratitude for your recent contribution. Your generosity plays a vital role in our mission.</p>
                            
                            <div class="receipt-box">
                                <div style="text-align: center; margin-bottom: 15px; font-size: 14px; color: #777; text-transform: uppercase; letter-spacing: 1px;">Donation Receipt</div>
                                <div class="receipt-row">
                                    <span class="receipt-label">Amount Received:</span>
                                    <span class="receipt-value">${formattedAmount}</span>
                                </div>
                                <div class="receipt-row">
                                    <span class="receipt-label">Date:</span>
                                    <span class="receipt-value">${date}</span>
                                </div>
                                ${goal ? `
                                <div class="receipt-row">
                                    <span class="receipt-label">Designated Towards:</span>
                                    <span class="receipt-value">${goal}</span>
                                </div>` : ''}
                            </div>
                            
                            <div class="impact-text">
                                Your gift directly empowers our efforts to provide quality education, essential healthcare, and safe shelter to underprivileged children across Nigeria. Together, we are building a brighter future.
                            </div>
                            
                            <p>If you have any questions regarding your donation or our programs, please do not hesitate to reach out.</p>
                            
                            <p>With deepest appreciation,</p>
                            <p><strong>The Board and Staff<br>Children's Hope Foundation</strong></p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Children's Hope Foundation. All rights reserved.</p>
                            <p>Lagos, Nigeria</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Donation email sent: ' + info.response);
        } catch (error) {
            console.error('Email failed to send:', error);
            // We still return 201 because the donation was recorded, even if the email failed
        }

        res.status(201).json({ id: insertedId, message: 'Donation recorded successfully' });
    });
});

// Handle Newsletter subscription
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const sql = 'INSERT INTO newsletter (email) VALUES ($1) RETURNING id';
    pool.query(sql, [email], async (err, result) => {
        if (err) {
            // Check if it's a unique constraint violation (Postgres code 23505)
            if (err.code === '23505') {
                return res.status(409).json({ error: 'Email already subscribed' });
            }
            console.error(err.stack);
            return res.status(500).json({ error: 'Failed to subscribe to newsletter' });
        }

        const insertedId = result.rows[0].id;

        // Send Welcome Email
        const mailOptions = {
            from: `"Children's Hope Foundation" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to the Children\'s Hope Foundation Community',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9; }
                        .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px; }
                        .header { background-color: #2a7ae4; color: #ffffff; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
                        .body-content { padding: 40px 30px; }
                        .body-content h2 { color: #2a7ae4; font-size: 20px; margin-top: 0; }
                        .highlight-box { background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 4px; border: 1px solid #eeeeee; }
                        .highlight-box strong { color: #0c1a4b; display: block; margin-bottom: 8px; font-size: 16px; }
                        .footer { background-color: #f1f1f1; padding: 20px 30px; text-align: center; font-size: 13px; color: #777777; }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="header">
                            <h1>Children's Hope Foundation</h1>
                        </div>
                        <div class="body-content">
                            <h2>Welcome to Our Community</h2>
                            <p>Dear Friend,</p>
                            <p>Thank you for subscribing to the Children's Hope Foundation newsletter. We are thrilled to welcome you to a dedicated community of changemakers who believe in the power of education, healthcare, and safe shelter for every child.</p>
                            
                            <div class="highlight-box">
                                <strong>What to Expect</strong>
                                As a subscriber, you will receive periodic updates highlighting the direct impact of our programs, insights from the field, and inspiring stories of the children whose lives are being transformed across Nigeria.
                            </div>
                            
                            <p>Your interest and advocacy are vital to our mission. If you would like to learn more about our current initiatives or discover ways to get involved, we invite you to explore our website.</p>
                            
                            <p>We look forward to sharing our journey with you.</p>

                            <p>Warm regards,</p>
                            <p><strong>The Team at Children's Hope Foundation</strong></p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} Children's Hope Foundation. All rights reserved.</p>
                            <p>Lagos, Nigeria</p>
                            <p style="font-size: 11px; margin-top: 15px;">You are receiving this email because you opted in via our website.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Newsletter welcome email sent: ' + info.response);
        } catch (error) {
            console.error('Email failed to send:', error);
        }

        res.status(201).json({ id: insertedId, message: 'Subscribed successfully' });
    });
});

// Health check endpoint (for UptimeRobot keep-alive pings)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server if listening directly (useful for local testing)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export the Express API
module.exports = app;
