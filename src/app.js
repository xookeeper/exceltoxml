const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('../routes/userRoutes')
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/users', userRoutes);

// Serve index.html as the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Serve login.html for /login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Serve register.html for /register route
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'register.html'));
});

// Serve converter.html for /converter route
app.get('/converter', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'converter.html'));
});

// Serve adminPanel.html for /adminPanel route
app.get('/adminPanel', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'adminPanel.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});