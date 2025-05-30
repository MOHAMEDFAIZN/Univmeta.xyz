require('dotenv').config();  // Load environment variables from .env file

const twilio = require('twilio'); // Twilio module for sending WhatsApp messages

// Twilio configuration for WhatsApp sandbox
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const { OpenAI } = require("openai");


const express = require('express');
const ExcelJS = require('exceljs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); // For JWT token
const puppeteer = require('puppeteer');
const path = require('path');
const mysql = require('mysql2');
const multer = require('multer');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 3078;  // Use environment variable for port

// Initialize multer
const upload = multer(); 

// Define the correct path to the database directory
const databasePath = path.join(__dirname); // Adjust if needed

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));  // Increase the limit if necessary
app.use(upload.none()); // This will handle `multipart/form-data` and turn it into `req.body`
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());  // Adds security headers
// Serve static files from the correct directory
app.use(express.static(databasePath));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,  // Use the session secret from .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true in production with HTTPS
}));


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MYSQL DATABASE CONNECTION //////////////////////////////////////////////////////////////////////////////////////
const connection = mysql.createConnection({
    host: process.env.DB_HOST,  
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME,  
    port: process.env.DB_PORT,  
    connectTimeout: 30000
});

// Second MySQL Connection (studentinfo - Student Information)
const studentDB = mysql.createConnection({
    host: process.env.DB_HOST,  
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    database: 'studentinfo',  // Second database
    port: process.env.DB_PORT,  
    connectTimeout: 30000
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Connect to studentinfo (Student Management)
studentDB.connect(err => {
    if (err) {
        console.error('Error connecting to studentinfo database:', err);
        return;
    }
    console.log('Connected to studentinfo database');
});

// Serve robots.txt explicitly
app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(databasePath, 'robots.txt'));
});

// Serve sitemap.xml explicitly
app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(databasePath, 'sitemap.xml'));
});

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Securely load API key from .env
  });
  
  // Mock Database for Form Status
  const forms = [
    { id: "123", status: "approved", name: "John Doe" },
    { id: "456", status: "pending", name: "Jane Smith" },
  ];
  
  // FAQs Data
  const faqs = [
    {
        question: "how do I apply for a form",
        answer:
          'To apply for a form, follow these steps:\n1. Go to the "Forms" section.\n2. Click on "Apply Now".\n3. Fill in the required details.\n4. Submit the form.',
      },
      {
        question: "hi",
        answer:
       "Hello! How can I help you Today?"},
       {
        question: "hello",
        answer:
       "Hello! How can I help you Today?"},
      {
        question: "how do I check my form status",
        answer:
          'You can check your form status by entering your form ID in the chatbot and asking, "What is the status of my form?"',
      },
      {
        question: "what should I do if my form is rejected",
        answer:
          "If your form is rejected, you can resubmit it after making the necessary corrections. Contact support if you need further assistance.",
      },
      {
        question: "how does this chatbot work",
        answer:
          'This chatbot can help you with:\n1. Checking your form status.\n2. Answering FAQs.\n3. Providing general assistance.\nType "help" to see a list of commands.',
      },
      {
        question: "what is the purpose of this application",
        answer:
          "AFAS automates Bonafide OD Leave and No Due processes reducing delays paperwork and errors. A web-based system enables digital approvals real-time tracking and transparency for students and faculty.",
      },
      {
        question: "how to i apply for leave form",
        answer:
          "Click the navbar on the index page to navigate to the Student Login page.Log in using your student ID and password on the student_login page.Click on the Application Form option after successful login to proceed to the application_form page.Select the Apply Leave Form option to open the leave_form page.Fill  your leave application details and submit the form.",
      },
      {
        question: "how to i apply for od form",
        answer:
          "Click the navbar on the index page to navigate to the Student Login page.Log in using your student ID and password on the student_login page.Click on the Application Form option after successful login to proceed to the application_form page.Select the Apply OD Form option to open the OD_form page.Fill  your OD application details and submit the form.",
      },
      {
        question: "how to i apply for no due form",
        answer:
          "Click the navbar on the index page to navigate to the Student Login page.Log in using your student ID and password on the student_login page.Click on the Application Form option after successful login to proceed to the application_form page.Select the Apply NO-Due Form option to open the NO-Due_form page.Fill  your NO-Due application details and submit the form.",
      },
      {
        question: "how to i apply for bonafide certificate form",
        answer:
          "Click the navbar on the index page to navigate to the Student Login page.Log in using your student ID and password on the student_login page.Click on the Application Form option after successful login to proceed to the application_form page.Select the Apply Bonafide Certificate Form option to open the Bonafide Certificate_form page.Fill  your Bonafide Certificate application details and submit the form.",
      },
      {
        question: "how to i apply for duplicate id card form",
        answer:
          "Click the navbar on the index page to navigate to the Student Login page.Log in using your student ID and password on the student_login page.Click on the Application Form option after successful login to proceed to the application_form page.Select the Apply Duplicate ID Card Form option to open the Duplicate ID Card_form page.Fill  your Duplicate ID Card application details and submit the form.",
      },
      {
        question: "how do i update my profile",
        answer:
          "To update your profile:\n1. Log in to your account.\n2. Go to the 'Profile' section.\n3. Make the necessary changes.\n4. Click 'Save' to update your profile.",
      },
      {
        question: "how do i reset my password",
        answer:
          "To reset your password:\n1. Go to the 'Student Login' page.\n2. Click on 'Forgot Password'.\n3. Enter your registered email address.\n4. Follow the instructions sent to your email to reset your password.",
      },
      {
        question: "what is univmeta",
        answer:
          "UnivMeta is a platform that automates Bonafide, OD Leave, and No Due processes, reducing delays, paperwork, and errors. It provides a web-based system for digital approvals, real-time tracking, and transparency for students and faculty.",
      },
      {
        question: "how do i get contact support",
        answer:
          "For support, please email us at support@univmeta.xyz or mail univmeta21@gmail.com.",
      },
      {
        question: "what are the features of this web page",
        answer:
          "The web page features include:\n1. Form automation for leave, OD, no-due, and more.\n2. Real-time form status tracking.\n3. AI-powered chatbot for assistance.\n4. User-friendly interface.",
      },
      {
        question: "how do i navigate the web page",
        answer:
          "To navigate the web page:\n1. Use the navbar at the top to access different sections.\n2. Click on 'Student Login' to log in and access forms.\n3. Use the chatbot for assistance.",
      },
  ];
  
  // Help Guide
  const helpGuide = `
  Welcome to the AI Chatbot! Here's what I can do:
  1. *Check Form Status*: Ask "What is the status of my form?" and provide your form ID.
  2. *FAQs*: Ask questions like "How do I apply for a form?" or "What if my form is rejected?"
  3. *General Assistance*: Ask me anything, and I'll do my best to help!
  Type "help" anytime to see this guide again.
  `;
  
  // AI Chatbot API Endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, formId } = req.body;
  
      const lowerCaseMessage = message.toLowerCase();
  
      // Help Guide
      if (lowerCaseMessage.includes("help")) {
        return res.json({ response: helpGuide });
      }
  
      // Check FAQs
      const faqMatch = faqs.find((faq) => lowerCaseMessage.includes(faq.question.toLowerCase()));
      if (faqMatch) {
        return res.json({ response: faqMatch.answer });
      }
  
      // Check Form Status
      if (lowerCaseMessage.includes("form status")) {
        const form = forms.find((f) => f.id === formId);
        if (form) {
          return res.json({ response: `Form status for ${form.name}: ${form.status}` });
        } else {
          return res.json({ response: "Form not found. Please check the form ID." });
        }
      }
  
      // Use OpenAI for general queries
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });
  
      res.json({ response: response.choices[0].message.content });
    } catch (error) {
      console.error("Error communicating with OpenAI:", error);
      res.status(500).json({ error: "Failed to process your request" });
    }
  });
  


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HOME PAGE //////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STUDENT LOGIN PAGE ROUTE ///////////////////////////////////////////////////////////////////////////////////////
// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Username and password are required'
        });
    }

    // Query to fetch student details, including faculty_id
    const query = `
        SELECT students.id, students.username, students.name, students.password, students.faculty_id
        FROM students
        WHERE students.username = ?
    `;

    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Internal Server Error'
            });
        }

        // Check if user exists
        if (results.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password.'
            });
        }

        const user = results[0];

        // Validate the password (insecure plaintext; recommend using bcrypt or similar)
        if (password === user.password) {
            // Store session details, including the unique user ID and faculty_id
            req.session.user = {
                id: user.id, // Unique user ID from the database
                username: user.username,
                name: user.name,
                faculty_id: user.faculty_id // Storing faculty_id in session
            };

            // Respond with user details
            res.json({
                status: 'success',
                message: 'Login successful!',
                data: {
                    student_id: user.id,
                    username: user.username,
                    name: user.name,
                    faculty_id: user.faculty_id // Include faculty_id in the response
                }
            });
        } else {
            res.status(401).json({
                status: 'error',
                message: 'Invalid username or password.'
            });
        }
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FACULTY LOGIN PAGE ROUTE ///////////////////////////////////////////////////////////////////////////////////////////
// Handle Faculty Login
app.post('/faculty/login', (req, res) => { 
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password are required' });
    }

    const query = 'SELECT * FROM faculty WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        if (results.length > 0 && password === results[0].password) {
            req.session.faculty = {
                faculty_id: results[0].faculty_id,
                username: results[0].username,
                role: 'faculty',
            };

            return res.status(200).json({
                status: 'success',
                message: 'Login successful!',
                username: results[0].username,
                redirectTo: '/faculty-dashboard'
            });
        } else {
            return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
        }
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADMIN LOGIN PAGE ROUTE //////////////////////////////////////////////////////////////////////////////////////////////
// Handle Admin Login 
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Username and password are required' 
        });
    }

    const query = 'SELECT admin_id, name, username, password FROM admin WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Internal Server Error' 
            });
        }

        if (results.length > 0 && password === results[0].password) {
            // Store admin details in the session
            req.session.admin = {
                admin_id: results[0].admin_id,
                name: results[0].name,
                username: results[0].username,
            };

            // Respond with a success message
            res.json({ 
                status: 'success', 
                message: 'Admin login successful!' 
            });
        } else {
            res.status(401).json({ 
                status: 'error', 
                message: 'Invalid username or password.' 
            });
        }
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FACULTY DASHBOARD PAGE /////////////////////////////////////////////////////////////////////////////////////////////
app.get('/faculty-dashboard', (req, res) => {
    console.log('Session data:', req.session);
    if (!req.session || !req.session.faculty) {
        console.log('No session found. Redirecting to login.');
        return res.redirect('/faculty-login.html');
    }
    console.log('Session valid. Serving dashboard.');
    res.sendFile(path.join(__dirname, 'public', 'faculty', 'Faculty Dashboard.html'));
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADMIN DASHBOARD PAGE ///////////////////////////////////////////////////////////////////////////////////////////////
app.get('/admin-dashboard', (req, res) => {
    if (!req.session.admin) return res.redirect('/admin-login');
    res.sendFile(path.join(__dirname, 'public', 'Admin', 'Admin Dashboard.html'));
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////LEAVE AND EVENT//////////////////////////////////////////
//////////// STUDENT ROUTES ////////////////////////// FETCHING ALL LEAVE APPLICATIONS ////////
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
// Route for fetching leave applications
app.get('/student-applications/leave', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not logged in' });
    }

    const studentId = req.session.user.id; // Fetch student_id from the session
    const leaveQuery = `
        SELECT 
            id, 
            "Leave" AS applicationType, 
            leaveType AS type, 
            reason, 
            DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') AS submission_date,
            status, 
            registerNo, 
            contactNo, 
            parentContactNo, 
            email, 
            department,
            DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate,
            DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate
        FROM leave_applications 
        WHERE student_id = ?
    `;
    connection.query(leaveQuery, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching leave applications:', err);
            return res.status(500).json({ error: 'Failed to fetch leave applications' });
        }
        res.json(results);
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////
///////////// EVENT APPLICATION ////////////////////// FETCHING ALL EVENT APPLICATIONS ///////////
app.get('/student-applications/event', (req, res) => { 
    const studentId = req.session.user.id;  // Get student ID from the session
    const applicationId = req.query.id;     // Optional query parameter for a specific application ID

    let eventQuery = `
        SELECT 
            id, 
            event_name AS type, 
            organizing_department AS reason, 
            DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') AS submission_date,
            status, 
            student_reg_no,
            DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
            student_name AS name
        FROM event_applications
    `;

    // Add condition to filter by student_id or specific application id
    if (applicationId) {
        eventQuery += ` WHERE id = ?;`;  // Filter by applicationId
        connection.query(eventQuery, [applicationId], (err, results) => {
            if (err) {
                console.error('Error fetching event applications:', err);
                return res.status(500).json({ error: 'Failed to fetch event applications' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Event application not found' });
            }

            res.json(results);  // Return application data
        });
    } else {
        eventQuery += ` WHERE student_id = ?;`;  // Filter by student_id from the session
        connection.query(eventQuery, [studentId], (err, results) => {
            if (err) {
                console.error('Error fetching event applications:', err);
                return res.status(500).json({ error: 'Failed to fetch event applications' });
            }

            // Return results or show no applications found
            if (results.length === 0) {
                return res.status(404).json({ error: 'No event applications found for this student' });
            }

            res.json(results);  // Return applications for the student
        });
    }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////LEAVE AND EVENT ///////////////////////////////////////////////////////////
/////// FACULTY ROUTES ///////////////////////////////// FETCHING ALL FACULTY PENDING APPLICATIONS/LEAVE/EVENT /////
app.get('/api/faculty/pending-applications/:type', (req, res) => {
    // Validate if faculty is logged in
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Please log in as a faculty member.' });
    }

    const facultyId = req.session.faculty.faculty_id; // Extract faculty_id from session
    const { type } = req.params;

    let query = '';
    let queryParams = [facultyId];

    // Determine query based on application type
    if (type === 'leave') {
        query = `
            SELECT 
                id, 
                "Leave" AS applicationType, 
                leaveType AS type, 
                name,
                reason, 
                DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate, 
                DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate, 
                DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') AS submission_date, 
                status,
                registerNo AS reg_no, 
                contactNo AS contact_no, 
                parentContactNo AS parent_contact_no, 
                email, 
                department 
            FROM leave_applications 
            WHERE status = 'Pending' AND faculty_id = ?
        `;
    } else if (type === 'event') {
        query = `
            SELECT 
                id, 
                student_name AS name, 
                "Event" AS applicationType, 
                DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date, 
                event_type, 
                organizing_department AS reason, 
                event_name AS type, 
                student_reg_no AS reg_no, 
                DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') AS submission_date, 
                status 
            FROM event_applications 
            WHERE status = 'Pending' AND faculty_id = ?
        `;
    } else {
        return res.status(400).json({ error: 'Invalid application type' });
    }

    // Execute the query
    connection.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.json(results);
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////// FACULTY UPDATE STATUS FOR LEAVE/EVENT /////////////////////////////////////////
app.post('/api/faculty/update-status', (req, res) => {  
    const { id, status, applicationType } = req.body;

    // Validate required fields
    if (!id || !status || !applicationType) {
        return res.status(400).json({ error: 'ID, status, and applicationType are required' });
    }

    // Validate applicationType
    if (!['Leave', 'Event'].includes(applicationType)) {
        return res.status(400).json({ error: 'Invalid application type' });
    }

    // Determine the table and student column based on applicationType
    const table = applicationType === 'Event' ? 'event_applications' : 'leave_applications';
    const studentIdColumn = applicationType === 'Event' ? 'student_id' : 'student_id';

    // Update the status in the respective table
    const query = `UPDATE ${table} SET status = ? WHERE id = ?`;

    connection.query(query, [status, id], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to update status' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Fetch student ID and application name
        const studentQuery = `SELECT ${studentIdColumn}, ${applicationType === 'Event' ? 'event_name' : 'leaveType'} AS applicationName, startDate, endDate FROM ${table} WHERE id = ?`;

        connection.query(studentQuery, [id], (studentErr, studentResults) => {
            if (studentErr) {
                console.error('Error fetching student data:', studentErr);
                return res.status(500).json({ error: 'Failed to fetch student information' });
            }

            if (studentResults.length === 0) {
                return res.status(404).json({ error: 'Student not found for the application' });
            }

            const studentId = studentResults[0][studentIdColumn];
            const applicationName = studentResults[0].applicationName;
            const startDate = studentResults[0].startDate;
            const endDate = studentResults[0].endDate;

            // Create a notification for the student
            const notificationMessage = `Your ${applicationType} application (${applicationName}) has been ${status.toLowerCase()} by the faculty.`;
            const notificationQuery = `
                INSERT INTO notifications (user_id, message, type, created_at) 
                VALUES (?, ?, 'approval', NOW())
            `;

            connection.query(notificationQuery, [studentId, notificationMessage], (notifErr) => {
                if (notifErr) {
                    console.error('Notification error:', notifErr);
                    return res.status(500).json({ error: 'Failed to send notification' });
                }


// If the application is a Leave request, update attendance logs based on status
if (applicationType === 'Leave') {
    let updateAttendanceQuery = '';

    if (status === 'Approved') {
        // Set 'A' (On Leave) if approved
        updateAttendanceQuery = `
            UPDATE studentinfo.attendance_logs 
            SET Status = 'A' 
            WHERE student_id = ? 
            AND EntryDate BETWEEN ? AND ? 
            AND Status = 'P';
        `;
    } else if (status === 'Rejected') {
        // Set 'P' (Present) if rejected
        updateAttendanceQuery = `
            UPDATE studentinfo.attendance_logs 
            SET Status = 'O' 
            WHERE student_id = ? 
            AND EntryDate BETWEEN ? AND ? 
            AND Status = 'P';
        `;
    }

    connection.query(updateAttendanceQuery, [studentId, startDate, endDate], (attErr, attResult) => {
        if (attErr) {
            console.error('Error updating attendance logs:', attErr);
            return res.status(500).json({ error: 'Failed to update attendance records' });
        }

        res.json({ message: `Status updated, attendance logs modified (${status}), and notification sent successfully` });
    });
}
 else {
                    // If it's an event or leave is rejected, return success without updating attendance
                    res.json({ message: 'Status updated and notification sent successfully' });
                }
            });
        });
    });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

////// ATT SYSTEM ///
// Fetch attendance details
// Fetch attendance details for the logged-in student
app.get('/api/attendance-details', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Student not logged in' });
    }

    const studentId = req.session.user.id;
    const query = 'SELECT * FROM studentinfo.attendancedetails WHERE student_id = ?';

    connection.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance details:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance details' });
        }
        res.json(results.length ? results : []);
    });
});

// Fetch attendance logs for a specific course (only for logged-in student)
app.get('/api/attendance-logs/:code', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Student not logged in' });
    }

    const studentId = req.session.user.id;
    const { code } = req.params;
    const query = 'SELECT * FROM studentinfo.attendance_logs WHERE Code = ? AND student_id = ?';

    connection.query(query, [code, studentId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance logs:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance logs' });
        }
        res.json(results.length ? results : []);
    });
});



////////////////////////// SUBMIT ROUTES FOR LEAVE //////////////////////////////////////////////////////
///////////////////////// LEAVE APPLICATION SUBMIT /////////////////////////////////////////////////////
// Handle the form submission POST request
let processedRequests = new Set();

app.post('/submit', (req, res) => {
    // Check if student is logged in
    if (!req.session.user) {
        return res.status(401).json({ status: 'error', message: 'Student not logged in' });
    }

    // Extract student ID from session
    const studentId = req.session.user.id;

    // Fetch attendance details for the student
    const attendanceQuery = `
        SELECT Code, Name, AttendancePercentage 
        FROM studentinfo.attendancedetails 
        WHERE student_id = ?
    `;

    connection.query(attendanceQuery, [studentId], (attErr, attendanceRecords) => {
        if (attErr) {
            console.error('Error fetching attendance:', attErr);
            return res.status(500).json({ status: 'error', message: 'Unable to fetch attendance records' });
        }

        // Check if any subject has attendance below 75%
        const lowAttendance = attendanceRecords.some(record => record.AttendancePercentage < 75);
        if (lowAttendance) {
            return res.status(400).json({ status: 'error', message: 'Attendance below 75%, leave application not allowed' });
        }

        // Fetch faculty ID and phone number
        const fetchFacultyQuery = `
            SELECT s.faculty_id, f.phone_no AS faculty_phone
            FROM univmeta.students s
            INNER JOIN univmeta.faculty f ON s.faculty_id = f.faculty_id
            WHERE s.id = ?
        `;

        connection.query(fetchFacultyQuery, [studentId], (fetchErr, results) => {
            if (fetchErr || results.length === 0) {
                console.error('Error fetching faculty details:', fetchErr || 'No faculty found');
                return res.status(500).json({ status: 'error', message: 'Unable to fetch faculty details' });
            }

            const { faculty_id: facultyId, faculty_phone: facultyPhone } = results[0];
            const formData = req.body;

            // Validate required fields
            if (
                !formData.name ||
                !formData.registerNo ||
                !formData.contactNo ||
                !formData.email ||
                !formData.parentContactNo ||
                !formData.department ||
                !formData.leaveType ||
                !formData.startDate ||
                !formData.endDate ||
                !formData.reason
            ) {
                return res.status(400).json({ status: 'error', message: 'Required fields are missing' });
            }

            // SQL query to insert leave application
            const insertLeaveQuery = `
                INSERT INTO leave_applications 
                (student_id, faculty_id, name, registerNo, contactNo, parentContactNo, email, department, leaveType, startDate, endDate, reason, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
            `;

            connection.query(
                insertLeaveQuery,
                [
                    studentId,
                    facultyId,
                    formData.name,
                    formData.registerNo,
                    formData.contactNo,
                    formData.parentContactNo,
                    formData.email,
                    formData.department,
                    formData.leaveType,
                    formData.startDate,
                    formData.endDate,
                    formData.reason
                ],
                (insertErr, result) => {
                    if (insertErr) {
                        console.error('Database error:', insertErr);
                        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
                    }

                    const notificationMessage = `A new leave application has been submitted by ${formData.name}.`;

                    // Detailed message for WhatsApp
                    const whatsappMessage = `
                        📢 *Leave Application Notification*  
                        Hello,  
                        
                        You have received a new leave application from your student on *univmeta.xyz*.  
                        
                        📝 *Details of the Application:*  
                        👤 *Name:* ${formData.name}  
                        🎓 *Register No:* ${formData.registerNo}  
                        📱 *Contact No:* ${formData.contactNo}  
                        📧 *Email:* ${formData.email}  
                        🏫 *Department:* ${formData.department}  
                        📅 *Leave Type:* ${formData.leaveType}  
                        🗓️ *From:* ${formData.startDate}  
                        🗓️ *To:* ${formData.endDate}  
                        🛑 *Reason:* ${formData.reason}  
                        
                        Please review the application and take necessary action.  
                        
                        *Visit your dashboard on univmeta.xyz to process the application.*  
                        
                        Thank you,  
                        Team *univmeta.xyz* 🌟
                    `;

                    // Insert notification for the faculty
                    const notificationQuery = `
                        INSERT INTO notifications (user_id, message, type, created_at) 
                        VALUES (?, ?, 'application', NOW())
                    `;

                    connection.query(notificationQuery, [facultyId, notificationMessage], (notifErr) => {
                        if (notifErr) {
                            console.error('Notification error:', notifErr);
                        }

                        // Send WhatsApp message to the faculty
                        twilioClient.messages
                            .create({
                                body: whatsappMessage,
                                from: twilioWhatsAppNumber,
                                to: `whatsapp:${facultyPhone}`,
                            })
                            .then((message) => {
                                console.log('WhatsApp message sent:', message.sid);
                            })
                            .catch((waErr) => {
                                console.error('WhatsApp sending error:', waErr);
                            });

                        const applicationId = result.insertId;
                        return res.json({ applicationId });
                    });
                }
            );
        });
    });
});

// New route to fetch attendance details for frontend
app.get('/attendance', (req, res) => {
    // Check if student is logged in
    if (!req.session.user) {
        return res.status(401).json({ status: 'error', message: 'Student not logged in' });
    }

    // Extract student ID from session
    const studentId = req.session.user.id;

    // Fetch attendance details for the student
    const attendanceQuery = `
        SELECT Code, Name, AttendancePercentage 
        FROM studentinfo.attendancedetails 
        WHERE student_id = ?
    `;

    connection.query(attendanceQuery, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching attendance:', err);
            return res.status(500).json({ status: 'error', message: 'Unable to fetch attendance records' });
        }

        return res.json({ attendanceRecords: results });
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// LEAVE APPLICATION DOWNLOAD ///////////////////////////////////////////////////////
// Function to format date in the desired format (e.g., "Wed Feb 22 2024")
function formatDate(date) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}
// Download leave certificate route
app.get('/download-leave-certificate/:applicationId', async (req, res) => {
    const applicationId = req.params.applicationId;

    // Query the database for the application by ID
    const query = 'SELECT * FROM leave_applications WHERE id = ?';
    connection.query(query, [applicationId], async (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching data from the database.');
        }

        if (results.length === 0 || results[0].status !== 'Approved') {
            console.error(`Leave application not approved or does not exist. Application ID: ${applicationId}`);
            return res.status(400).send('Leave application not approved or does not exist.');
        }

        const application = results[0];
        const templateFilePath = path.join(__dirname, 'templates', 'certificate-template.html');

        // Read the certificate template file
        fs.readFile(templateFilePath, 'utf-8', async (err, template) => {
            if (err) {
                console.error('Template file read error:', err.message);
                return res.status(500).send('Error reading the template file.');
            }

            // Replace placeholders with application data
            const leaveApplicationContent = template
                .replace('{{date}}', new Date().toLocaleDateString()) // Today's date
                .replace('{{department}}', application.department)
                .replace('{{name}}', application.name)
                .replace('{{registerNo}}', application.registerNo)
                .replace('{{department}}', application.department)
                .replace('{{name}}', application.name)
                .replace('{{department}}', application.department)
                .replace('{{contactNo}}', application.contactNo)
                .replace('{{parentContactNo}}', application.parentContactNo)
                .replace('{{email}}', application.email)
                .replace('{{leaveType}}', application.leaveType)
                .replace('{{startDate}}', formatDate(application.startDate)) // Format start date
                .replace('{{endDate}}', formatDate(application.endDate)) // Format end date
                .replace('{{reason}}', application.reason)
                .replace('{{name}}', application.name);

            try {
                // Launch Puppeteer to generate a PDF from the HTML content
                const browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });

                const page = await browser.newPage();
                await page.setContent(leaveApplicationContent, { waitUntil: 'networkidle0' });

                const pdfBuffer = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
                });

                await browser.close();

                // Set response headers to download the PDF
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="leave-application.pdf"');
                res.setHeader('Content-Length', pdfBuffer.length);

                // Send the PDF buffer as the response
                res.status(200).end(pdfBuffer);

            } catch (pdfErr) {
                console.error('Error generating PDF:', pdfErr);
                return res.status(500).send('Error generating PDF.');
            }
        });
    });
});


///////printleave//

app.get('/print-leave-certificate/:applicationId', async (req, res) => { 
    const applicationId = req.params.applicationId;

    const query = 'SELECT * FROM leave_applications WHERE id = ?';
    connection.query(query, [applicationId], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching data from the database.');
        }

        if (results.length === 0 || results[0].status !== 'Approved') {
            console.error(`Leave application not approved or does not exist. Application ID: ${applicationId}`);
            return res.status(400).send('Leave application not approved or does not exist.');
        }

        const application = results[0];
        const templateFilePath = path.join(__dirname, 'templates', 'certificate-template.html');

        fs.readFile(templateFilePath, 'utf-8', (err, template) => {
            if (err) {
                console.error('Template file read error:', err.message);
                return res.status(500).send('Error reading the template file.');
            }

            
            const certificateContent = template
                
                .replace('{{date}}', new Date().toLocaleDateString())
                .replace('{{department}}', application.department)
                .replace('{{name}}', application.name)
                .replace('{{registerNo}}', application.registerNo)
                .replace('{{department}}', application.department)
                .replace('{{name}}', application.name)
                .replace('{{department}}', application.department)
                .replace('{{contactNo}}', application.contactNo)
                .replace('{{parentContactNo}}', application.parentContactNo)
                .replace('{{email}}', application.email)
                .replace('{{leaveType}}', application.leaveType)
                .replace('{{startDate}}', formatDate(application.startDate))
                .replace('{{endDate}}', formatDate(application.endDate))
                .replace('{{reason}}', application.reason)
                .replace('{{name}}', application.name);

                res.send(`
                    <html>
                    <head>
                        <title>Print Certificate</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                        <script src="/js/print.js" defer></script> <!-- External script for print button -->
                        <style>
                            /* Ensure A4 size print layout */
                            @page { size: A4; margin: 0; } 
    
                            /* General Styling */
                            body { 
                                font-family: Arial, sans-serif; 
                                margin: 0; 
                                padding: 0;
                                background: white;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: flex-start;
                                min-height: 100vh;
                                width: 100vw;
                                overflow: auto; /* Enables scrolling */
                            }
    
                            /* Print button styling */
                            .print-container {
                                position: absolute;
                                top: 20px;
                                left: 20px;
                                z-index: 1000;
                            }
                            .print-btn { 
                                background-color: black; 
                                color: white; 
                                padding: 10px 15px; 
                                font-size: 14px; 
                                cursor: pointer;
                                border-radius: 5px;
                                border: none;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            }
                            .print-btn:hover { background-color: #333; }
    
                            /* Certificate container */
                            .certificate-container {
                                width: 100%;
                                max-width: 800px;
                                padding: 20px;
                                
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                            }
    
                            /* Footer */
                            .footer {
                                text-align: center;
                                font-size: 14px;
                                color: gray;
                                padding: 10px;
                                width: 100%;
                                position: relative;
                                bottom: 0;
                            }
    
                            /* Print formatting */
                            @media print {
                                .print-container { display: none; } /* Hide print button */
                                body {
                                    width: 210mm;
                                    height: 297mm;
                                    margin: 0;
                                    padding: 0;
                                    transform: scale(1); /* Ensures exact fit */
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    align-items: center;
                                    overflow: hidden; /* Prevents extra pages */
                                }
                                .certificate-container {
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: center;
                                    align-items: center;
                                }
                                .footer {
                                    position: absolute;
                                    bottom: 10px;
                                    width: 100%;
                                    font-size: 14px;
                                    color: black;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <!-- Print button at the top-left -->
                        <div class="print-container">
                            <button id="printButton" class="print-btn">
                                <i class="fas fa-print"></i> Print Certificate
                            </button>
                        </div>
    
                        <!-- Certificate Content -->
                        <div class="certificate-container">${certificateContent}</div>
    
                        <!-- Footer (Always Visible) -->
                        <div class="footer">Powered by UnivMeta</div>
                    </body>
                    </html>
                `);
            });
        });
    });




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// DOWNLOAD EVENT PARTICIPATION ////////////////////////////////////////////////////
// Function to format the date (same as in the leave applications)
// Format the date
function formatDate(date) { 
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Generate PDF function
const generatePDF = async (content, res) => {
    try {
        // Launch the browser instance
        const browser = await chromium.launch({
            headless: true, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        // Create a new page
        const page = await browser.newPage();

        // Set the HTML content of the page
        await page.setContent(content, { waitUntil: 'networkidle0' });

        // Generate the PDF buffer
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '5mm', bottom: '5mm', left: '5mm', right: '5mm' },
        });

        // Close the browser
        await browser.close();

        // Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="event-application-certificate.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer as the response
        res.status(200).end(pdfBuffer);

    } catch (error) {
        // Handle any errors
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF.');
    }
};

// Route to download Event Application Certificate
app.get('/download-event-certificate/:applicationId', async (req, res) => {
    const applicationId = req.params.applicationId;

    // SQL query to fetch the event application data from the database
    const query = 'SELECT * FROM event_applications WHERE id = ?';
    connection.query(query, [applicationId], async (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching data from the database.');
        }

        if (results.length === 0 || results[0].status !== 'Approved') {
            console.error(`Event application not approved or does not exist. Application ID: ${applicationId}`);
            return res.status(400).send('Event application not approved or does not exist.');
        }

        const application = results[0];

        // Path to the event certificate template file
        const templateFilePath = path.join(__dirname, 'templates', 'OD Certificate.html');
        console.log('Template Path:', templateFilePath);

        // Read the template file
        fs.readFile(templateFilePath, 'utf-8', async (err, template) => {
            if (err) {
                console.error('Template file read error:', err.message);
                return res.status(500).send('Error reading the template file.');
            }

            // Replace placeholders in the template with application data
            const eventCertificateContent = template
                .replace('{{submissionDate}}', formatDate(application.submission_date) || 'N/A')
                .replace('{{eventName}}', application.event_name || 'N/A')
                .replace('{{eventDate}}', formatDate(application.event_date) || 'N/A')
                .replace('{{organizingDepartment}}', application.organizing_department || 'N/A')
                .replace('{{numberOfDays}}', application.number_of_days || 'N/A')
                .replace('{{eventType}}', application.event_type || 'N/A')
                .replace('{{studentRegNo}}', application.student_reg_no || 'N/A')
                .replace('{{studentName}}', application.student_name || 'N/A');

            // Call the generatePDF function with the content and response
            await generatePDF(eventCertificateContent, res);
        });
    });
});

module.exports = app;



/// print event ///

// Function to format dates
function formatDate(date) { 
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Route to print Event Application Certificate
app.get('/print-event-certificate/:applicationId', async (req, res) => {
    const applicationId = req.params.applicationId;

    // Fetch event application data from the database
    const query = 'SELECT * FROM event_applications WHERE id = ?';
    connection.query(query, [applicationId], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching data from the database.');
        }

        if (results.length === 0 || results[0].status !== 'Approved') {
            console.error(`Event application not approved or does not exist. Application ID: ${applicationId}`);
            return res.status(400).send('Event application not approved or does not exist.');
        }

        const application = results[0];

        // Template with placeholders replaced dynamically
        const certificateContent = `
            <!DOCTYPE html> 
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OD Certificate</title>
                <link rel="stylesheet" href="/css/styles.css">  <!-- External CSS file -->
                <script src="/js/print.js" defer></script>  <!-- External JavaScript file -->
            </head>
            <body>
                <!-- Print button at the top-left -->
                <div class="print-container">
                    <button id="printButton" class="print-btn">
                        <i class="fas fa-print"></i> Print Certificate
                    </button>
                </div>

                <div class="certificate-container">
                    <div class="header">
                        <img src="https://www.univmeta.xyz/General%20Assest/Kalasalingam_Black.png" alt="Institution Logo" />
                        <h1>Event Participation Approval Certificate</h1>
                    </div>

                    <div class="content">
                        <p><label>Submission Date:</label> <span>${formatDate(application.submission_date)}</span></p>
                        <p><label>Name of the Event:</label> <span>${application.event_name}</span></p>
                        <p><label>Date:</label> <span>${formatDate(application.event_date)}</span></p>
                        <p><label>Organizing Department / Club / College:</label> <span>${application.organizing_department}</span></p>
                        <p><label>Number of Days:</label> <span>${application.number_of_days}</span></p>
                        <p><label>Type of Event:</label> <span>${application.event_type}</span></p>
                        <p><label>Register Number:</label> <span>${application.student_reg_no}</span></p>
                        <p><label>Name of the Student:</label> <span>${application.student_name}</span></p>
                    </div>

                    <div class="signature-section">
                        <div class="signature">
                            <img src="https://www.univmeta.xyz/Student/Student%20Assest/Faculty%20Advisor.jpg" alt="Class Coordinator Image">
                            <p>Class Coordinator</p>
                            <div class="signature-line"></div>
                        </div>
                        <div class="signature">
                            <img src="https://www.univmeta.xyz/Student/Student%20Assest/HOD.jpg" alt="HOD Image">
                            <p>Head of the Department</p>
                            <div class="signature-line"></div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">Powered by UnivMeta</div>
            </body>
            </html>
        `;

        res.send(certificateContent);
    });
});

module.exports = app;

                
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// EVENT PARTICIPATION APPROVAL SUBMIT ////////////////////////////////////////
// Submit Event Form Route
// Submit Event Form Route
app.post('/submit-event-form', (req, res) => { 
    const {
        submissionDate,  // In YYYY-MM-DD format (e.g., 2024-11-30)
        eventName,
        eventDate,
        organizingDepartment,
        numberOfDays,
        eventType,
        studentRegNo,
        studentName
    } = req.body;

    // Validate input fields
    if (
        !submissionDate ||
        !eventName ||
        !eventDate ||
        !organizingDepartment ||
        !numberOfDays ||
        !eventType ||
        !studentRegNo ||
        !studentName
    ) {
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    // Check if session is active and faculty_id exists
    if (!req.session.user || !req.session.user.faculty_id) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized. Please log in again.'
        });
    }

    // Get the current date and time (MySQL DATETIME format)
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Converts to 'YYYY-MM-DD HH:MM:SS'

    // Get the student_id and faculty_id from session
    const studentId = req.session.user.id;
    const facultyId = req.session.user.faculty_id;

    // SQL query to insert into the event_applications table
    const query = `
        INSERT INTO event_applications (
            submission_date, 
            event_name, 
            event_date, 
            organizing_department, 
            number_of_days, 
            event_type, 
            student_reg_no, 
            student_name, 
            status, 
            student_id,
            faculty_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `;

    connection.query(
        query,
        [
            currentDateTime,  // Store current date and time
            eventName,
            eventDate,
            organizingDepartment,
            numberOfDays,
            eventType,
            studentRegNo,
            studentName,
            studentId,  // Add student_id from session
            facultyId   // Add faculty_id from session
        ],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ status: 'error', message: 'Failed to submit event form' });
            }

            // Insert a notification for the faculty
            const notificationQuery = `
                INSERT INTO notifications (user_id, message, type, created_at) 
                VALUES (?, ?, 'application', NOW())
            `;
            const notificationMessage = `A new event application has been submitted by ${studentName}, Register Number:${studentRegNo} .`;

            connection.query(notificationQuery, [facultyId, notificationMessage], (notifErr) => {
                if (notifErr) {
                    console.error('Notification error:', notifErr); // Log notification error
                    return res.status(500).json({ status: 'error', message: 'Failed to send notification' });
                }

                 // Fetch faculty and student email addresses
                const fetchFacultyQuery = `
                SELECT students.faculty_id, faculty.username AS facultyEmail, students.username AS studentEmail 
                FROM students 
                JOIN faculty ON students.faculty_id = faculty.faculty_id 
                WHERE students.id = ?
            `;

            connection.query(fetchFacultyQuery, [studentId], (fetchErr, results) => {
                if (fetchErr) {
                    console.error('Error fetching emails:', fetchErr);
                    return res.status(500).json({ status: 'error', message: 'Failed to fetch email details' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ status: 'error', message: 'Faculty or student not found' });
                }

                const facultyEmail = results[0].facultyEmail;
                const studentEmail = results[0].studentEmail;

                // Email setup
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD // Update with your email password
                    }
                });

                // Email to Faculty
                const mailOptionsFaculty = {
                    from: process.env.EMAIL_USER,
                    to: facultyEmail,
                    subject: 'UnivMeta | New Event Application Requires Your Review',
                    html: `
                        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f9; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                                <div style="text-align: center;">
                                    <img src="https://www.univmeta.xyz/UNIVMETA_BLACK.png" alt="UnivMeta Logo" style="max-width: 100px; margin-bottom: 15px;">
                                </div>
                                <h3 style="color: #333333; text-align: center;">New Event Application</h3>
                                <p style="color: #555555; text-align: center;">A new event application has been submitted and requires your attention.</p>
                                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                                <p style="color: #333333; line-height: 1.6;">
                                    <strong>Student Name:</strong> ${studentName}<br>
                                    <strong>Register Number:</strong> ${studentRegNo}<br>
                                    <strong>Event Name:</strong> ${eventName}<br>
                                    <strong>Event Date:</strong> ${eventDate}<br>
                                    <strong>Department:</strong> ${organizingDepartment}
                                </p>
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="https://www.univmeta.xyz/faculty/Faculty%20Login%20Page.html" style="background-color: #007bff; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Review Now</a>
                                </div>
                                <p style="color: #999999; font-size: 0.85em; text-align: center;">Thank you for supporting UnivMeta’s mission to enhance academic engagement.</p>
                            </div>
                        </div>
                    `
                };

                // Email to Student
                const mailOptionsStudent = { 
                    from: process.env.EMAIL_USER,
                    to: studentEmail,
                    subject: 'UnivMeta | Your Event Application Has Been Submitted',
                    html: `
                        <div style="font-family: 'Arial', sans-serif; background-color: #f4f4f9; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                                <div style="text-align: center;">
                                    <img src="https://www.univmeta.xyz/UNIVMETA_BLACK.png" alt="UnivMeta Logo" style="max-width: 100px; margin-bottom: 15px;">
                                </div>
                                <h3 style="color: #333333; text-align: center;">Your Application is Under Review</h3>
                                <p style="color: #555555; text-align: center;">Thank you for submitting your event application. Here are the details:</p>
                                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
                                <p style="color: #333333; line-height: 1.6;">
                                    <strong>Event Name:</strong> ${eventName}<br>
                                    <strong>Event Date:</strong> ${eventDate}<br>
                                    <strong>Department:</strong> ${organizingDepartment}
                                </p>
                                <p style="color: #555555; text-align: center;">Your application is being reviewed by the faculty. You can track its progress in your dashboard.</p>
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="https://www.univmeta.xyz/Student/login.html" style="background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Application</a>
                                </div>
                                <p style="color: #999999; font-size: 0.85em; text-align: center;">Thank you for being an active participant in UnivMeta.</p>
                            </div>
                        </div>
                    `
                };

                // Send emails to both faculty and student
                transporter.sendMail(mailOptionsFaculty, (facultyErr) => {
                    if (facultyErr) {
                        console.error('Failed to send faculty email:', facultyErr);
                    }
                });

                transporter.sendMail(mailOptionsStudent, (studentErr) => {
                    if (studentErr) {
                        console.error('Failed to send student email:', studentErr);
                    }
                });

                // Send a success response to the student
                res.status(201).json({ 
                    status: 'success', 
                    message: 'Event form submitted successfully', 
                    applicationId: result.insertId 
                });
            });
        });
        }
    );
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// NOTIFICATION SECTION FOR LEAVE/EVENT /////////////////////////////////////////////
// Fetch notifications for the logged-in user (faculty or student)
app.get('/api/notifications', (req, res) => {
    const sessionUser = req.session.user || req.session.faculty;

    if (!sessionUser) {
        return res.status(401).json({ error: 'Unauthorized access. Please log in.' });
    }

    // Check if user is a student or faculty
    const isStudent = !!req.session.user;
    const userId = isStudent ? req.session.user.id : req.session.faculty.faculty_id;

    // Build query based on role
    const query = `
        SELECT id, message, type, created_at, is_read 
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    `;

    // Execute the query with the relevant user ID
    connection.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Return notifications
        res.json(results);
    });
});


/////////////////////////////// CHANGE PASSWORD SECTION //////////////////////////////////////////////////////////
//////////////////////////////// STUDENT CHANGE PASSWORD ////////////////////////////////////////////////////////
app.post('/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user?.id; // Get user ID from session

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields.'
        });
    }

    const getUserQuery = 'SELECT password FROM students WHERE id = ?';
    connection.query(getUserQuery, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found.'
            });
        }

        const user = results[0];

        // Check if current password matches
        if (currentPassword !== user.password) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect.'
            });
        }

        // Update to new password
        const updateQuery = 'UPDATE students SET password = ? WHERE id = ?';
        connection.query(updateQuery, [newPassword, userId], (updateErr) => {
            if (updateErr) {
                console.error('Database error:', updateErr.message);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to update password.'
                });
            }

            res.json({
                status: 'success',
                message: 'Password updated successfully!'
            });
        });
    });
});


//////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// FACULTY CHANGE PASSWORD ////////////////////////////////////////////////////
app.post('/faculty/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'All fields are required.'
        });
    }

    const query = 'SELECT * FROM faculty WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Faculty member not found.'
            });
        }

        const faculty = results[0];

        if (faculty.password !== currentPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect.'
            });
        }

        const updateQuery = 'UPDATE faculty SET password = ? WHERE username = ?';
        connection.query(updateQuery, [newPassword, username], (updateErr) => {
            if (updateErr) {
                console.error('Database error:', updateErr.message);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to update password.'
                });
            }

            res.json({
                status: 'success',
                message: 'Password changed successfully.'
            });
        });
    });
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ADMIN CHANGE PASSWORD //////////////////////////////////////////////////
app.post('/admin/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({
            status: 'error',
            message: 'All fields are required.'
        });
    }

    const query = 'SELECT * FROM admin WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error.'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Admin not found.'
            });
        }

        const admin = results[0];

        if (admin.password !== currentPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect.'
            });
        }

        const updateQuery = 'UPDATE admin SET password = ? WHERE username = ?';
        connection.query(updateQuery, [newPassword, username], (updateErr) => {
            if (updateErr) {
                console.error('Database error:', updateErr.message);
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to update password.'
                });
            }

            res.json({
                status: 'success',
                message: 'Password changed successfully.'
            });
        });
    });
});
/////////////////////////////////// PASSWORD END ///////////////////////////////////////////////////

/////////////////////////// APPLICATIONS SECTION /////////////////////////////////////////////////////
//////////////////////// BONOFIDE APPLICATIONS WITH E-MAIL NOTIFICATION /////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// Email setup (use your own credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Host email address
        pass: process.env.EMAIL_PASSWORD // Host email password
    }
});

// Route to submit bonafide requisition
app.post('/api/student/submit-bonafide-requisition', (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Student not logged in' });
    }

    const studentId = req.session.user.id;
    const studentEmail = req.session.user.username; // Fetch student email from session
    const {
        name,
        registerNumber,
        department,
        gender,
        yearSemester,
        guardianName,
        mobileNumber,
        email,
        reason,
        hscMode,
        scholarshipMode,
        diplomaCgpa = [],
        ugPgCgpa = [],
        bonafideReceived,
        bonafideReason,
        cgpa = [],
        admissionFees = [],
        miscellaneousFees = [],
        tuitionFees = [],
        hostelFees = [],
        busFees = []
    } = req.body;

    // Validation for arrays
    if (!Array.isArray(admissionFees) || !Array.isArray(miscellaneousFees) ||
        !Array.isArray(tuitionFees) || !Array.isArray(hostelFees) || !Array.isArray(busFees)) {
        return res.status(400).json({ message: 'Fee details must be provided as arrays' });
    }

    const [
        admissionFee1stYear = 0, admissionFee2ndYear = 0, admissionFee3rdYear = 0,
        admissionFee4thYear = 0, admissionFee5thYear = 0
    ] = admissionFees;

    const [
        miscellaneousFee1stYear = 0, miscellaneousFee2ndYear = 0, miscellaneousFee3rdYear = 0,
        miscellaneousFee4thYear = 0, miscellaneousFee5thYear = 0
    ] = miscellaneousFees;

    const [
        tuitionFee1stYear = 0, tuitionFee2ndYear = 0, tuitionFee3rdYear = 0,
        tuitionFee4thYear = 0, tuitionFee5thYear = 0
    ] = tuitionFees;

    const [
        hostelFee1stYear = 0, hostelFee2ndYear = 0, hostelFee3rdYear = 0,
        hostelFee4thYear = 0, hostelFee5thYear = 0
    ] = hostelFees;

    const [
        busFee1stYear = 0, busFee2ndYear = 0, busFee3rdYear = 0,
        busFee4thYear = 0, busFee5thYear = 0
    ] = busFees;

    // Query to fetch the faculty email
    const fetchFacultyQuery = `
        SELECT students.faculty_id, faculty.username AS facultyEmail 
        FROM students 
        JOIN faculty ON students.faculty_id = faculty.faculty_id 
        WHERE students.id = ?`;

    connection.query(fetchFacultyQuery, [studentId], (err, result) => {
        if (err) {
            console.error('Database error while fetching faculty email:', err.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'No faculty found for the student' });
        }

        const facultyId = result[0].faculty_id;
        const facultyEmail = result[0].facultyEmail;

        // SQL query to insert the bonafide requisition into the database
        const insertRequisitionQuery = `
            INSERT INTO bonafiderequisition (
                date, name, registerNumber, department, gender, yearSemester, guardianName,
                mobileNumber, email, reason, hscMode, scholarshipMode, diplomaCgpa, ugPgCgpa,
                bonafideReceived, bonafideReason, cgpa, admissionFee1stYear, admissionFee2ndYear, 
                admissionFee3rdYear, admissionFee4thYear, admissionFee5thYear, miscellaneousFee1stYear, 
                miscellaneousFee2ndYear, miscellaneousFee3rdYear, miscellaneousFee4thYear, 
                miscellaneousFee5thYear, tuitionFee1stYear, tuitionFee2ndYear, tuitionFee3rdYear, 
                tuitionFee4thYear, tuitionFee5thYear, hostelFee1stYear, hostelFee2ndYear, 
                hostelFee3rdYear, hostelFee4thYear, hostelFee5thYear, busFee1stYear, busFee2ndYear, 
                busFee3rdYear, busFee4thYear, busFee5thYear, status, student_id, faculty_id
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )`;

        connection.query(
            insertRequisitionQuery,
            [
                new Date(),
                name,
                registerNumber,
                department,
                gender,
                yearSemester,
                guardianName,
                mobileNumber,
                email,
                reason,
                hscMode,
                scholarshipMode,
                diplomaCgpa,
                ugPgCgpa,
                bonafideReceived,
                bonafideReason,
                cgpa,
                admissionFee1stYear,
                admissionFee2ndYear,
                admissionFee3rdYear,
                admissionFee4thYear,
                admissionFee5thYear,
                miscellaneousFee1stYear,
                miscellaneousFee2ndYear,
                miscellaneousFee3rdYear,
                miscellaneousFee4thYear,
                miscellaneousFee5thYear,
                tuitionFee1stYear,
                tuitionFee2ndYear,
                tuitionFee3rdYear,
                tuitionFee4thYear,
                tuitionFee5thYear,
                hostelFee1stYear,
                hostelFee2ndYear,
                hostelFee3rdYear,
                hostelFee4thYear,
                hostelFee5thYear,
                busFee1stYear,
                busFee2ndYear,
                busFee3rdYear,
                busFee4thYear,
                busFee5thYear,
                'Pending',
                studentId,
                facultyId
            ],
            (insertErr, insertResult) => {
                if (insertErr) {
                    console.error('Error inserting requisition:', insertErr.message);
                    return res.status(500).json({ message: 'Error submitting requisition' });
                }

                // Send notification emails
                const mailOptionsFaculty = {
                    from: process.env.EMAIL_USER,
                    to: facultyEmail,
                    subject: 'New Bonafide Requisition Submitted',
                    text: `Dear Faculty,\n\nA new Bonafide Requisition has been submitted by student: ${name}. Please review the request.`,
                };

                const mailOptionsStudent = { 
                    from: process.env.EMAIL_USER,
                    to: studentEmail,
                    subject: 'UnivMeta | Bonafide Requisition Submitted',
                    html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Bonafide Requisition Submitted</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f9f9f9;
                                    color: #333333;
                                    margin: 0;
                                    padding: 0;
                                }
                
                                .email-container {
                                    max-width: 600px;
                                    margin: 30px auto;
                                    background-color: #ffffff;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                                    overflow: hidden;
                                    border: 1px solid #dddddd;
                                }
                
                                .header {
                                    background-color: #000000;
                                    color: #ffffff;
                                    text-align: center;
                                    padding: 20px;
                                }
                
                                .header img {
                                    width: 60px;
                                    height: 60px;
                                    border-radius: 50%;
                                    margin-bottom: 10px;
                                }
                
                                .header h1 {
                                    font-size: 18px;
                                    margin: 0;
                                }
                
                                .content {
                                    padding: 20px 30px;
                                    text-align: left;
                                }
                
                                .content p {
                                    font-size: 16px;
                                    line-height: 1.5;
                                    margin: 10px 0;
                                }
                
                                .footer {
                                    background-color: #f9f9f9;
                                    text-align: center;
                                    padding: 15px;
                                    font-size: 14px;
                                    color: #666666;
                                    border-top: 1px solid #dddddd;
                                }
                
                                .footer a {
                                    color: #000000;
                                    text-decoration: none;
                                }
                
                                .footer a:hover {
                                    text-decoration: underline;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <!-- Header -->
                                <div class="header">
                                    <img src="https://www.univmeta.xyz/UNIVMETA_BLACK.png" alt="UnivMeta Logo">
                                    <h1>UnivMeta | Bonafide Requisition</h1>
                                </div>
                
                                <!-- Content -->
                                <div class="content">
                                    <p>Dear ${name},</p>
                                    <p>
                                        Your Bonafide Requisition has been successfully submitted. It is currently pending review by your faculty. 
                                        You will be notified once the status is updated.
                                    </p>
                                    <p>
                                        Thank you for choosing UnivMeta for streamlining your academic processes. 
                                        If you have any questions, feel free to reach out to our support team.
                                    </p>
                                </div>
                
                                <!-- Footer -->
                                <div class="footer">
                                    <p>&copy; 2024 UnivMeta. All Rights Reserved.</p>
                                    <p><a href="https://univmeta.xyz">Visit UnivMeta</a> | <a href="mailto:support@univmeta.xyz">Contact Support</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                    `,
                };                

                transporter.sendMail(mailOptionsFaculty, (err, info) => {
                    if (err) {
                        console.error('Error sending email to faculty:', err.message);
                        return res.status(500).json({ message: 'Error notifying faculty via email' });
                    }

                    transporter.sendMail(mailOptionsStudent, (err, info) => {
                        if (err) {
                            console.error('Error sending email to student:', err.message);
                            return res.status(500).json({ message: 'Error notifying student via email' });
                        }

                        console.log('Emails sent successfully');
                        // Send response with application details
                        res.status(200).json({
                            message: 'Bonafide requisition submitted successfully',
                            studentName: name,
                            studentId: registerNumber, // Ensure this is correct
                            applicationName: 'Bonafide Certificate',
                            applicationId: insertResult.insertId // Ensure this is fetched correctly
                        
                   }); }); 
                });
            }
        );
    });
});

////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/download-bonafide-application/:applicationId', async (req, res) => {
    const applicationId = req.params.applicationId;

    const query = 'SELECT * FROM bonafiderequisition WHERE id = ?';
    connection.query(query, [applicationId], async (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).send('Error fetching data from the database.');
        }

        if (results.length === 0 || results[0].status !== 'Approved') {
            console.error(`Bonafide application not approved or does not exist. Application ID: ${applicationId}`);
            return res.status(400).send('Bonafide application not approved or does not exist.');
        }

        const application = results[0];
        const templateFilePath = path.join(__dirname, 'templates', 'Bonafide Certificate.html');

        // Read the certificate template
        fs.readFile(templateFilePath, 'utf-8', async (err, template) => {
            if (err) {
                console.error('Template file read error:', err.message);
                return res.status(500).send('Error reading the template file.');
            }

            // Prepare Fee Details
            const feeDetails = [
                { label: 'One Time Admission Fee', value: application.admissionFee1stYear },
                { label: 'Miscellaneous Fee', value: application.miscellaneousFee1stYear },
                { label: 'Tuition Fee', value: application.tuitionFee1stYear },
                { label: 'Hostel Fee', value: application.hostelFee1stYear },
                { label: 'Bus Fee', value: application.busFee1stYear }
            ];

            let feeRows = '';
            let grandTotal = 0;

            feeDetails.forEach(fee => {
                grandTotal += fee.value || 0;
                feeRows += `
                    <tr>
                        <td>${fee.label}</td>
                        <td>${application.yearSemester || 'N/A'}</td>
                        <td>${fee.value || 0}</td>
                    </tr>`;
            });

            // Replace placeholders
            const certificateContent = template
                .replace('{{certificateNo}}', `BONAFIDE-${application.id}`)
                .replace('{{issueDate}}', new Date().toLocaleDateString())
                .replace('{{studentName}}', application.name)
                .replace('{{registerNo}}', application.registerNumber)
                .replace('{{parentName}}', application.guardianName || 'N/A')
                .replace('{{year}}', application.yearSemester || 'N/A')
                .replace('{{course}}', application.department || 'N/A')
                .replace('{{academicYear}}', '2023 – 2024') // Example
                .replace('{{purpose}}', application.reason || 'N/A')
                .replace('{{feeRows}}', feeRows)
                .replace('{{grandTotal}}', grandTotal);

            try {
                // Generate PDF
                const browser = await puppeteer.launch({ headless: true });
                const page = await browser.newPage();
                await page.setContent(certificateContent, { waitUntil: 'networkidle0' });

                const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
                await browser.close();

                // Send PDF response
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="bonafide-certificate-${applicationId}.pdf"`);
                res.status(200).end(pdfBuffer);
            } catch (err) {
                console.error('Error generating PDF:', err.message);
                res.status(500).send('Error generating PDF.');
            }
        });
    });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/api/faculty/application/:id', (req, res) => {
    const applicationId = req.params.id;

    const query = 'SELECT * FROM bonafiderequisition WHERE id = ?';
    connection.query(query, [applicationId], (err, results) => {
        if (err) {
            console.error('Error fetching application details:', err.message);
            return res.status(500).json({ message: 'Error fetching application details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json(results[0]); // Send the first result (application details)
    });
});



/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/api/faculty/pending-bonafide-requisitions', (req, res) => {
    

    if (!req.session.faculty || !req.session.faculty.faculty_id || req.session.faculty.role !== 'faculty') {
        return res.status(401).json({ message: 'Unauthorized: Faculty not logged in' });
    }

    const facultyId = req.session.faculty.faculty_id; // Fetch faculty_id from the session

    const query = `
        SELECT * FROM bonafiderequisition
        WHERE faculty_id = ? AND status = 'Pending'
    `;

    connection.query(query, [facultyId], (err, results) => {
        if (err) {
            console.error('Error fetching pending requisitions:', err.message);
            return res.status(500).json({ message: 'Error fetching requisitions' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No pending requisitions found' });
        }

        res.json(results);
    });
});


app.post('/api/faculty/approve-requisition', (req, res) => {
    console.log('Session Data:', req.session); // Debugging session

    const { requisitionId, status, facultyId } = req.body;

    if (!requisitionId || !['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid requisitionId or status.' });
    }

    const updateStatusQuery = `
        UPDATE bonafiderequisition 
        SET status = ?, faculty_id = ? 
        WHERE id = ? AND status = 'Pending'
    `;

    connection.query(updateStatusQuery, [status, facultyId, requisitionId], (err, result) => {
        if (err) {
            console.error('Error updating requisition status:', err.message);
            return res.status(500).json({ message: 'Error updating requisition status.' });
        }

        if (result.affectedRows === 0) {
            console.error('Requisition not found or already processed.');
            return res.status(404).json({ message: 'Requisition not found or already processed.' });
        }

        // Fetch student details to notify
        const fetchStudentQuery = `
            SELECT name, username AS email 
            FROM students 
            WHERE id = (SELECT student_id FROM bonafiderequisition WHERE id = ?)
        `;

        connection.query(fetchStudentQuery, [requisitionId], (err, studentResult) => {
            if (err) {
                console.error('Error fetching student details:', err.message);
                return res.status(500).json({ message: 'Error fetching student details.' });
            }

            const studentEmail = studentResult[0]?.email;
            const studentName = studentResult[0]?.name;

            if (!studentEmail) {
                console.error('Student email not found.');
                return res.status(404).json({ message: 'Student email not found.' });
            }

                   // Send notification email
const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: studentEmail, // Recipient address
    subject: `UnivMeta | Bonafide Requisition Status Update`,
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bonafide Requisition Status</title>
            <style>
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f7f7f7;
                    color: #333;
                }

                .email-container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }

                .header {
                    background-color: #000000;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                }

                .header img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    margin-bottom: 10px;
                }

                .header h1 {
                    font-size: 22px;
                    margin: 10px 0 5px;
                }

                .content {
                    padding: 20px 30px;
                }

                .content h2 {
                    font-size: 20px;
                    margin-bottom: 15px;
                }

                .content p {
                    font-size: 16px;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }

                .status-box {
                    padding: 15px;
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    text-align: center;
                    margin-bottom: 20px;
                }

                .status-box span {
                    font-size: 22px;
                    font-weight: bold;
                    color: #000000;
                }

                .button-container {
                    text-align: center;
                }

                .action-button {
                    display: inline-block;
                    background-color: #000000;
                    color: #ffffff;
                    padding: 12px 25px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 20px;
                }

                .action-button:hover {
                    background-color: #444444;
                }

                .footer {
                    background-color: #f9f9f9;
                    text-align: center;
                    padding: 20px;
                    font-size: 14px;
                    color: #777;
                    border-top: 1px solid #eee;
                }

                .footer a {
                    color: #000000;
                    text-decoration: none;
                }

                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <!-- Header -->
                <div class="header">
                    <img src="https://www.univmeta.xyz/UNIVMETA_BLACK.png" alt="UnivMeta Logo">
                    <h1>Bonafide Requisition</h1>
                    <p>UnivMeta - Streamlining University Processes</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <h2>Dear ${studentName},</h2>
                    <p>We are pleased to inform you that your Bonafide Requisition status has been updated by the faculty. Below are the details:</p>
                    <div class="status-box">
                        <p>Current Status:</p>
                        <span>${status}</span>
                    </div>
                    <p>Thank you for using UnivMeta to streamline your academic processes. You can log in to your dashboard to view more details and track your requisition status.</p>
                    <div class="button-container">
                        <a href="#" class="action-button">View Dashboard</a>
                    </div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p>Need assistance? Visit our <a href="#">Support Center</a> or contact us at <a href="mailto:support@univmeta.com">support@univmeta.xyz</a>.</p>
                    <p>&copy; 2024 UnivMeta. All Rights Reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `,
};
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err.message);
                    return res.status(500).json({ message: 'Error notifying student via email.' });
                }

                console.log('Email sent:', info.response);
                res.status(200).json({ message: `Requisition ${status.toLowerCase()} successfully` });
            });
        });
    });
});


///////////////////////////////////////////////////////////////////////////////////////////////
app.post('/api/admin/approve-bonafide-status', (req, res) => {
    if (!req.session.user || !req.session.user.id || req.session.user.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized: Admin not logged in' });
    }

    const adminId = req.session.user.id; // Admin ID from session
    const { requisitionId, status } = req.body;

    // Validate status value (Pending, Approved, Rejected)
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Valid options: Pending, Approved, Rejected' });
    }

    // SQL query to check if the requisition has been approved by the faculty
    const fetchFacultyStatusQuery = `
        SELECT status 
        FROM bonafiderequisition 
        WHERE id = ? AND status = 'Approved'`;

    connection.query(fetchFacultyStatusQuery, [requisitionId], (err, result) => {
        if (err) {
            console.error('Error while checking requisition status:', err.message);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result.length === 0) {
            // If no results or the faculty has not approved yet
            return res.status(400).json({ message: 'Requisition not approved by faculty yet' });
        }

        // Proceed with updating the status since faculty has approved
        const updateStatusQuery = `
            UPDATE bonafiderequisition 
            SET status = ?, admin_id = ? 
            WHERE id = ? AND status = 'Approved'`; // Admin can only approve/reject if faculty has approved

        connection.query(updateStatusQuery, [status, adminId, requisitionId], (err, result) => {
            if (err) {
                console.error('Database error while updating requisition status:', err.message);
                return res.status(500).json({ message: 'Error updating requisition status' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Requisition not found or already processed' });
            }

            // Send email to the student about the status update
            const fetchStudentQuery = `
                SELECT name, email FROM students WHERE id = (SELECT student_id FROM bonafiderequisition WHERE id = ?)`;
            
            connection.query(fetchStudentQuery, [requisitionId], (err, studentResult) => {
                if (err) {
                    console.error('Error fetching student email:', err.message);
                    return res.status(500).json({ message: 'Error fetching student details' });
                }

                const studentEmail = studentResult[0]?.email;
                const studentName = studentResult[0]?.name;

                if (!studentEmail) {
                    return res.status(404).json({ message: 'Student email not found.' });
                }

                // Send notification email to the student
                const mailOptions = {
                    from: 'univmetacorporate@gmail.com', // sender address
                    to: studentEmail, // recipient address
                    subject: `Your Bonafide Requisition Status has been updated`,
                    text: `Dear ${studentName},\n\nYour Bonafide Requisition status has been updated to: ${status} by the Admin.\n\nThank you!`
                };

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error('Error sending email:', err);
                        return res.status(500).json({ message: 'Error notifying student via email' });
                    }

                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({ message: 'Bonafide requisition status updated successfully by Admin' });
                });
            });
        });
    });
});

// Route to fetch applications for admin review
app.get('/admin-applications', (req, res) => {
    // Query to fetch applications with faculty approval and pending admin approval
    const query = `
        SELECT id, name, registerNumber, department, yearSemester, gender, reason, 
               status, status2, date 
        FROM univmeta.bonafiderequisition 
        WHERE status = 'Approved'
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching admin applications:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// Route to update admin approval status
app.post('/update-admin-status', (req, res) => {
    const { applicationId, status2 } = req.body;

    if (!applicationId || !status2) {
        return res.status(400).json({ message: 'Invalid request data' });
    }

    const query = `
        UPDATE univmeta.bonafiderequisition 
        SET status2 = ? 
        WHERE id = ?
    `;

    connection.query(query, [status2, applicationId], (err, results) => {
        if (err) {
            console.error('Error updating admin status:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.json({ message: 'Admin status updated successfully' });
    });
});

///////////////////////VEIW APPLICATIONS BONAFIDE ///////////////////////////////////////////
app.get('/student-applications', (req, res) => {
    // Ensure that the user is logged in
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Student not logged in' });
    }

    const studentId = req.session.user.id; // Get the student ID from the session
    const query = 'SELECT * FROM bonafiderequisition WHERE student_id = ?';

    // Query the database for all the applications submitted by the student
    connection.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Error fetching applications' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No applications found' });
        }

        res.status(200).json(results); // Return the applications data to the frontend
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route for Total Applications
app.get('/api/student-applications/total-applications', (req, res) => {
    const query = `SELECT COUNT(*) AS totalApplications FROM bonafiderequisition;`;
  
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching total applications:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({
        totalApplications: results[0].totalApplications,
      });
    });
  });
  
  // Route for Pending Reviews
  app.get('/api/faculty/pending-applications', (req, res) => {
    const query = `SELECT COUNT(*) AS pendingReviews FROM bonafiderequisition WHERE status = 'Pending';`;
  
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching pending reviews:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({ pendingReviews: results[0].pendingReviews });
    });
  });
  
  // Route for Approved Applications
  app.get('/api/faculty/approved-forms', (req, res) => {
    const query = `SELECT COUNT(*) AS approvedForms FROM bonafiderequisition WHERE status = 'Approved';`;
  
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching approved forms:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({ approvedForms: results[0].approvedForms });
    });
  });
  
  // Route for Rejected Applications
  app.get('/api/faculty/rejected-forms', (req, res) => {
    const query = `SELECT COUNT(*) AS rejectedForms FROM bonafiderequisition WHERE status = 'Rejected';`;
  
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching rejected forms:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json({ rejectedForms: results[0].rejectedForms });
    });
  });

  
/// FACULTY ///
  // Middleware to check faculty authentication
const authenticateFaculty = (req, res, next) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }
    next();
};

// 1️⃣ Route: Get total bonafide applications for the logged-in faculty
app.get('/api/faculty-bonafide/total', authenticateFaculty, (req, res) => {
    const facultyId = req.session.faculty.faculty_id;
    const query = `SELECT COUNT(*) AS totalApplications FROM bonafiderequisition WHERE faculty_id = ?;`;

    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching total applications:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({ totalApplications: results[0].totalApplications || 0 });
    });
});

// 2️⃣ Route: Get pending bonafide applications for the logged-in faculty
app.get('/api/faculty-bonafide/pending', authenticateFaculty, (req, res) => {
    const facultyId = req.session.faculty.faculty_id;
    const query = `SELECT COUNT(*) AS pendingApplications FROM bonafiderequisition WHERE status = 'Pending' AND faculty_id = ?;`;

    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching pending applications:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({ pendingApplications: results[0].pendingApplications || 0 });
    });
});

// 3️⃣ Route: Get approved bonafide applications for the logged-in faculty
app.get('/api/faculty-bonafide/approved', authenticateFaculty, (req, res) => {
    const facultyId = req.session.faculty.faculty_id;
    const query = `SELECT COUNT(*) AS approvedApplications FROM bonafiderequisition WHERE status = 'Approved' AND faculty_id = ?;`;

    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching approved applications:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({ approvedApplications: results[0].approvedApplications || 0 });
    });
});

// 4️⃣ Route: Get rejected bonafide applications for the logged-in faculty
app.get('/api/faculty-bonafide/rejected', authenticateFaculty, (req, res) => {
    const facultyId = req.session.faculty.faculty_id;
    const query = `SELECT COUNT(*) AS rejectedApplications FROM bonafiderequisition WHERE status = 'Rejected' AND faculty_id = ?;`;

    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching rejected applications:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(200).json({ rejectedApplications: results[0].rejectedApplications || 0 });
    });
});


/////////////////////////////////////////////////////////////////////////////////////////////
  app.get('/api/export-bonafide', async (req, res) => {
    try {
        // Query to fetch all table contents
        connection.query('SELECT * FROM bonafiderequisition', async (err, results) => {
            if (err) {
                console.error('Error fetching data from database:', err);
                res.status(500).send('Error fetching data');
                return;
            }

            // Create a new Excel workbook and sheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Bonafide Applications');

            // Add headers to the worksheet
            const headers = Object.keys(results[0]);
            worksheet.addRow(headers);

            // Add rows with data
            results.forEach((row) => {
                worksheet.addRow(Object.values(row));
            });

            // Auto-adjust column width
            worksheet.columns.forEach((column) => {
                column.width = column.values.reduce((max, val) => {
                    return Math.max(max, val ? val.toString().length : 10);
                }, 10);
            });

            // Set the response headers and send the Excel file
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=bonafide_applications.xlsx'
            );

            await workbook.xlsx.write(res);
            res.end();
        });
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Error generating Excel file');
    }
});
///////////////////////////// DEVELOPMENT UNDERWAY /////////////////////////////////
///////////////////////////// APPLICATIONS END /////////////////////////////////////////////////

//////////////////////// ADMIN/FACULTY REPORT SECTION LEAVE/ EVENT /////////////////////////////////////
/////////////////// EVENT APPLICATIONS DOWNLOAD EXCEL /////////////////////////////////////////
// Route to download Event Applications as Excel
// ADMIN ///
app.get('/api/event-applications/download', async (req, res) => {
    try {
        const query = 'SELECT * FROM univmeta.event_applications;';
        connection.query(query, async (error, results) => {
            if (error) {
                console.error('Error fetching event applications for Excel:', error);
                return res.status(500).send('Error fetching event applications');
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Event Applications');

            // Add headers
            worksheet.columns = Object.keys(results[0]).map((key) => ({
                header: key.charAt(0).toUpperCase() + key.slice(1),
                key,
                width: 20,
            }));

            // Add rows
            results.forEach((row) => {
                worksheet.addRow(row);
            });

            // Send Excel file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="EventApplications.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        });
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).send('Error generating Excel');
    }
});


////////////////////// ADMIN/FACULTY EVENT APPLICATIONS REPORT ///////////////////////////////////////////////
/// ADMIN //
// Route to fetch total event applications
app.get('/api/event-applications/total', (req, res) => {
    const query = 'SELECT COUNT(*) AS totalApplications FROM univmeta.event_applications;';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching total applications:', error);
            res.status(500).send('Error fetching total applications');
        } else {
            res.json({ totalApplications: results[0].totalApplications });
        }
    });
});

// Route to fetch pending event applications
app.get('/api/event-applications/pending', (req, res) => {
    const query = 'SELECT COUNT(*) AS pendingApplications FROM univmeta.event_applications WHERE status = "Pending";';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching pending applications:', error);
            res.status(500).send('Error fetching pending applications');
        } else {
            res.json({ pendingApplications: results[0].pendingApplications });
        }
    });
});

// Route to fetch approved event applications
app.get('/api/event-applications/approved', (req, res) => {
    const query = 'SELECT COUNT(*) AS approvedApplications FROM univmeta.event_applications WHERE status = "Approved";';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching approved applications:', error);
            res.status(500).send('Error fetching approved applications');
        } else {
            res.json({ approvedApplications: results[0].approvedApplications });
        }
    });
});

// Route to fetch rejected event applications
app.get('/api/event-applications/rejected', (req, res) => {
    const query = 'SELECT COUNT(*) AS rejectedApplications FROM univmeta.event_applications WHERE status = "Rejected";';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching rejected applications:', error);
            res.status(500).send('Error fetching rejected applications');
        } else {
            res.json({ rejectedApplications: results[0].rejectedApplications });
        }
    });
});


///// FACULTY ///////////////////////////
// Route to fetch total event applications for the logged-in faculty
app.get('/API/faculty/event-applications/total', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;
    console.log(`Fetching total applications for faculty: ${facultyId}`);

    const query = 'SELECT COUNT(*) AS totalApplications FROM univmeta.event_applications WHERE faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching total applications:', error);
            res.status(500).send('Error fetching total applications');
        } else {
            res.json({ totalApplications: results[0].totalApplications });
        }
    });
});

// Route to fetch pending event applications for the logged-in faculty
app.get('/API/faculty/event-applications/pending', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;

    const query = 'SELECT COUNT(*) AS pendingApplications FROM univmeta.event_applications WHERE status = "Pending" AND faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching pending applications:', error);
            res.status(500).send('Error fetching pending applications');
        } else {
            res.json({ pendingApplications: results[0].pendingApplications });
        }
    });
});

// Route to fetch approved event applications for the logged-in faculty
app.get('/API/faculty/event-applications/approved', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;

    const query = 'SELECT COUNT(*) AS approvedApplications FROM univmeta.event_applications WHERE status = "Approved" AND faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching approved applications:', error);
            res.status(500).send('Error fetching approved applications');
        } else {
            res.json({ approvedApplications: results[0].approvedApplications });
        }
    });
});

// Route to fetch rejected event applications for the logged-in faculty
app.get('/API/faculty/event-applications/rejected', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;

    const query = 'SELECT COUNT(*) AS rejectedApplications FROM univmeta.event_applications WHERE status = "Rejected" AND faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching rejected applications:', error);
            res.status(500).send('Error fetching rejected applications');
        } else {
            res.json({ rejectedApplications: results[0].rejectedApplications });
        }
    });
});


/////////////////////////// ADMIN EVENT VEIW APPLICATIONS ROUTE //////////////////////////////////////
// Route to fetch all Event Applications
app.get('/api/event-applications', (req, res) => {
    const query = 'SELECT * FROM univmeta.event_applications;';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching event applications:', error);
            res.status(500).send('Error fetching event applications');
        } else {
            res.json(results);
        }
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////// ADMIN/FACULTY LEAVE APPLICATIONS REPORT //////////////////////////////////////////////////////////
// Route: Get Statistics (Total, Pending, Approved, Rejected)
// ADMIN //
app.get('/api/leave-applications/stats', (req, res) => {
    const statsQuery = `
      SELECT 
        COUNT(*) AS total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) AS approved,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) AS rejected
      FROM univmeta.leave_applications;
    `;
  
    connection.query(statsQuery, (err, results) => {
      if (err) {
        console.error('Error fetching statistics', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({
        total: results[0].total,
        pending: results[0].pending,
        approved: results[0].approved,
        rejected: results[0].rejected,
      });
    });
  });
  

  //// FACULTY/// 
  app.get('/API/faculty/leave-applications/approved', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;

    const query = 'SELECT COUNT(*) AS approvedLeaveApplications FROM univmeta.leave_applications WHERE status = "Approved" AND faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching approved leave applications:', error);
            res.status(500).send('Error fetching approved leave applications');
        } else {
            res.json({ approvedLeaveApplications: results[0].approvedLeaveApplications });
        }
    });
});

app.get('/API/faculty/leave-applications/rejected', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;

    const query = 'SELECT COUNT(*) AS rejectedLeaveApplications FROM univmeta.leave_applications WHERE status = "Rejected" AND faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching rejected leave applications:', error);
            res.status(500).send('Error fetching rejected leave applications');
        } else {
            res.json({ rejectedLeaveApplications: results[0].rejectedLeaveApplications });
        }
    });
});

app.get('/API/faculty/leave-applications/pending', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;

    const query = 'SELECT COUNT(*) AS pendingLeaveApplications FROM univmeta.leave_applications WHERE status = "Pending" AND faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching pending leave applications:', error);
            res.status(500).send('Error fetching pending leave applications');
        } else {
            res.json({ pendingLeaveApplications: results[0].pendingLeaveApplications });
        }
    });
});

app.get('/API/faculty/leave-applications/total', (req, res) => {
    if (!req.session.faculty || !req.session.faculty.faculty_id) {
        return res.status(401).json({ error: 'Unauthorized. Faculty not logged in.' });
    }

    const facultyId = req.session.faculty.faculty_id;
    console.log(`Fetching total leave applications for faculty: ${facultyId}`);

    const query = 'SELECT COUNT(*) AS totalLeaveApplications FROM univmeta.leave_applications WHERE faculty_id = ?';
    connection.query(query, [facultyId], (error, results) => {
        if (error) {
            console.error('Error fetching total leave applications:', error);
            res.status(500).send('Error fetching total leave applications');
        } else {
            res.json({ totalLeaveApplications: results[0].totalLeaveApplications });
        }
    });
});



  /////////////////////////// ADMIN LEAVE VIEW APPLICATIONS ROUTE ///////////////////////////////////////
  // Route: Fetch All Leave Applications
  app.get('/api/leave-applications', (req, res) => {
    const fetchQuery = `
      SELECT 
        id, 
        name, 
        leaveType, 
        startDate, 
        endDate, 
        status 
      FROM univmeta.leave_applications;
    `;
  
    connection.query(fetchQuery, (err, results) => {
      if (err) {
        console.error('Error fetching applications', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(results);
    });
  });


  /////////////////////////////////////////////////////////////////////////////////////////////
  //////////// ADMIN DOWNLOAD EXCEL LEAVE APPLICATIONS ///////////////////////////////////////
  // Route: Download Leave Applications as Excel
  app.get('/api/leave-applications/download', async (req, res) => {
    const fetchQuery = `
      SELECT 
        id, 
        name, 
        leaveType, 
        startDate, 
        endDate, 
        status 
      FROM univmeta.leave_applications;
    `;
  
    connection.query(fetchQuery, async (err, results) => {
      if (err) {
        console.error('Error fetching data for download', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leave Applications');
  
      // Add header row
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Applicant Name', key: 'name', width: 30 },
        { header: 'LeaveType', key: 'leaveType', width: 20 },
        { header: 'StartDate', key: 'startDate', width: 15 },
        { header: 'EndDate', key: 'endDate', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];
  
      // Add data rows
      results.forEach(application => {
        worksheet.addRow({
          id: application.id,
          name: application.name,
          leaveType: application.leaveType,
          startDate: application.startDate,
          endDate: application.endDate,
          status: application.status,
        });
      });
  
      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=leave_applications.xlsx'
      );
  
      // Write Excel data to response
      await workbook.xlsx.write(res);
      res.end();
    });
  });

//////////////////FACULTY VEIW REPORT //////////



///////////////////////////////////// ADMIN/FACULTY REPORT SECTION END LEAVE/ EVENT //////////////////////////////////

//////////////////////////////////// PRODUCT UNIVMETA STARTS REGISTRATION PROCESS /////////////////////////////
// Student Registration Endpoint
app.post("/register/student", (req, res) => {
    const { register_number, username, password, name, faculty_id, department } = req.body;

    if (!register_number || !username || !password || !name || !faculty_id || !department) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const studentQuery = `
        INSERT INTO students (username, password, name, faculty_id, department)
        VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(
        studentQuery,
        [username, password, name, faculty_id, department],
        (err, result) => {
            if (err) {
                console.error("Error inserting student record:", err.message);
                return res.status(500).json({ message: "Failed to register student." });
            }
            
            // ✅ Use `username` as the email parameter
            sendConfirmationEmail(username, name);
 
            res.status(201).json({ message: "Student registered successfully!", studentId: result.insertId });
        }
    );
});
/// FACULTY //
// Faculty Registration Endpoint
app.post("/register/faculty", (req, res) => {
    const { faculty_id, username, password, name, department, phone_no } = req.body;

    if (!faculty_id || !username || !password || !name || !department || !phone_no) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const facultyQuery = `
        INSERT INTO faculty (faculty_id, username, password, name, department, phone_no)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        facultyQuery,
        [faculty_id, username, password, name, department, phone_no],
        (err, result) => {
            if (err) {
                console.error("Error inserting faculty record:", err.message);
                return res.status(500).json({ message: "Failed to register faculty." });
            }
            
            // ✅ Use `username` as the email parameter
            sendConfirmationEmail(username, name);

            res.status(201).json({ message: "Faculty registered successfully!", facultyId: result.insertId });
        }
    );
});

///////////////////////////////////////////// MAIL /////////////////////////////////////////
function sendConfirmationEmail(to, name) { 
    const mailOptions = {
        from: `"UnivMeta Registration" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: "Welcome to UnivMeta.xyz - Registration Confirmation",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #222; color: #fff; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">UnivMeta<span style="color: #bbb;">.xyz</span></h1>
                </div>
                <div style="padding: 20px;">
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Thank you for registering with <strong>UnivMeta.xyz</strong>. We are excited to have you as part of our community.</p>
                    <p>To receive important updates and notifications directly through WhatsApp, please follow these simple steps:</p>
                    
                    <!-- WhatsApp Section -->
                    <div style="background-color: #25D366; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                        <p style="font-size: 18px; color: #fff; margin-bottom: 10px;">Stay Updated with UnivMeta Notifications!</p>
                        <p style="font-size: 16px; color: #fff; margin-bottom: 20px;">Click the button below or simply send <strong>join location-sport</strong> to our WhatsApp number to start receiving notifications.</p>
                        <a href="https://wa.me/14155238886?text=join%20location-sport" target="_blank" style="background-color: #128C7E; color: #fff; padding: 12px 25px; border-radius: 50px; font-size: 16px; text-decoration: none; display: inline-block;">
                            <strong>Join Now on WhatsApp</strong>
                        </a>
                    </div>

                    <!-- Regular Content -->
                    <p>By subscribing, you'll receive real-time notifications for upcoming events, news, and other important updates directly via WhatsApp.</p>
                    <p>If you have any questions or need support, don't hesitate to contact us at <a href="mailto:support@univmeta.xyz" style="color: #007BFF;">support@univmeta.xyz</a>.</p>
                    <p>We look forward to keeping you connected with the latest happenings at UnivMeta!</p>
                    <p>Best regards,<br><strong>UnivMeta Team</strong></p>
                </div>
                <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #555;">
                    <p>&copy; 2024 UnivMeta<span style="color: #bbb;">.xyz</span>. All Rights Reserved.</p>
                    <p>Visit us at <a href="https://www.univmeta.xyz" style="color: #007BFF;">www.univmeta.xyz</a></p>
                </div>
            </div>
        `
    };
    

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending email:", err.message);
        } else {
            console.log("Email sent successfully:", info.response);
        }
    });
}

///// REGISTERATION FETCHING AVAILABLE FACULTY ///////////////////////////////////////////////////////////////////
// Route to fetch faculty data 
app.get('/fetch/faculty-data', (req, res) => {
    const query = 'SELECT faculty_id AS id, name FROM faculty';
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).json({ error: 'Database query failed' });
            return;
        }
        
        res.json({ faculty: results });
    });
});

/////////////////////// student information system ///////////////////////////////////////////
// Route to fetch student details from studentinfo by registration number
app.get('/students/:register_number', (req, res) => {
    const registerNumber = req.params.register_number;
    const sql = 'SELECT * FROM students WHERE regno = ?';

    studentDB.query(sql, [registerNumber], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Database query error' });
        } else if (result.length === 0) {
            res.status(404).json({ message: 'Student not found' });
        } else {
            res.json(result[0]); // Return student details
        }
    });
});


// **POST Route - HOD Login**
app.post("/hodlogin", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            status: "error", 
            message: "Username and password are required" 
        });
    }

    const query = "SELECT hod_id, name, username, password FROM hod WHERE username = ?";
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ 
                status: "error", 
                message: "Internal Server Error" 
            });
        }

        if (results.length > 0 && password === results[0].password) {
            // Store HOD details in the session
            req.session.hod = {
                hod_id: results[0].hod_id,
                name: results[0].name,
                username: results[0].username,
            };

            res.json({ 
                status: "success", 
                message: "HOD login successful!" 
            });
        } else {
            res.status(401).json({ 
                status: "error", 
                message: "Invalid username or password." 
            });
        }
    });
});

module.exports = app;

////////////////////// //////////////////REGISTRATION END //////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Logout Route (Handles all roles) ////////////////////////////////////////////////////
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ status: 'error', message: 'Failed to destroy session' });
        }
        res.redirect('/');
    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Start the Server ///////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// WWW.UNIVMETA.XYX--THE END ///////////////////////////////////////////////////
///////////////////////////////// DEVELOPED BY AFAS TEAMS /////////////////////////////////////////////////////