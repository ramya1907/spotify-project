const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const axios = require('axios');

const LAST_FM_API_KEY = '846e19279fa31e6d74cad5d88e4a1a1f';

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


app.get('/view', (req, res) => {
  
  res.sendFile(path.join(__dirname, 'client/src/app/view/view.component.html'));
});

app.get('/api/message', (req, res) => {
   
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

// Validate Access Token
app.get('/api/validate-token', async (req, res) => {
    const accessToken = req.query.token;
    try {
      // Make a request to the Last.fm API to validate the access token
      const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=auth.getSession&api_key=${LAST_FM_API_KEY}&token=${accessToken}&format=json`);
      const data = response.data;
  
      if (data.session && data.session.name) {
        // The access token is valid
        const username = data.session.name;
        res.status(200).json({ authenticated: true, username: username });    
        
      } else {
        // The access token is invalid or expired
        res.status(401).json({ authenticated: false });
      }
    } catch (error) {
      // Handle any errors that occurred during the API request
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Serve the static files from the dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist', 'client'))); 

// For all other routes, serve the Angular index.html file
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'client', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
