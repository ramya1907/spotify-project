const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Use the cors middleware to allow cross-origin requests
app.use(cors());

// handling CORS (if you want to set specific CORS options)
// app.use(cors({
//   origin: 'http://localhost:4200', // Replace with your Angular app's URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Optional: Define allowed HTTP methods
//   allowedHeaders: ['Content-Type', 'Authorization'] // Optional: Define allowed request headers
// }));

// handling CORS
// app.use((req, res, next) => {
// 	res.header("Access-Control-Allow-Origin",
// 			"http://localhost:4200");
// 	res.header("Access-Control-Allow-Headers",
// 			"Origin, X-Requested-With, Content-Type, Accept");
// 	next();
// });

// Create a connection pool using the JawsDB URL
const pool = mysql.createPool({
    host: 'g84t6zfpijzwx08q.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'fzwpgfjd48gy1m31',
    password: 'qekonw2ct7cj72v7',
    database: 'uz5qkmicfrywgwuc',
    port: '3306'
});


// route for handling requests from the Angular client
// app.get('/api/message', (req, res) => {
// 	res.json({ message:
// 			'Hello GEEKS FOR GEEKS Folks from the Express server!' });
// });

app.get('/api/message', (req, res) => {
    // Sample query to the JawsDB MySQL database

    const mathOperationQuery = 'SELECT 1 + 1 AS result';

    pool.query(mathOperationQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json({ message: results });
        }
    });
});

// Serve the static files from the dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist', 'client'))); 

// For all other routes, serve the Angular index.html file
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'client', 'index.html'));
});
// app.listen(3000, () => {
// 	console.log('Server listening on port 3000');
// });

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});