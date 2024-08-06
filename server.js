const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/misc', express.static(path.join(__dirname, 'misc')));

// Serve log files dynamically
app.get('/logs/:password.txt', (req, res) => {
    const password = req.params.password;
    const logFilePath = path.join(__dirname, 'logs', `${password}.txt`);

    res.sendFile(logFilePath, (err) => {
        if (err) {
            res.status(404).send('Log not found');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
