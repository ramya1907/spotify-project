const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Use the cors middleware to allow cross-origin requests
app.use(cors());

// Create a connection pool using the JawsDB URL
const pool = mysql.createPool({
    host: 'g84t6zfpijzwx08q.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'fzwpgfjd48gy1m31',
    password: 'qekonw2ct7cj72v7',
    database: 'uz5qkmicfrywgwuc',
    port: '3306'
});

// app.get('/api/message', (req, res) => {
   
//     const mathOperationQuery = 'SELECT 1 + 1 AS result';

//     pool.query(mathOperationQuery, (err, results) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).json({ error: 'Internal server error' });
//         } else {
//             res.json({ message: results });
//         }
//     });
// });

// Serve the static files from the dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist', 'client'))); 

// For all other routes, serve the Angular index.html file
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
