const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { dynamoDB } = require('./dist//js/database');
// require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files

const AWS = require('aws-sdk');
const dynamoDBTest = new AWS.DynamoDB();


console.log('AWS Config:', {
    accessKeyId: ACCESS_KEY_ID ? '******' : 'Not Set',
    region: AWS.config.region,
});


dynamoDBTest.listTables({}, (err, data) => {
  if (err) {
    console.error('Error listing tables:', err);
  } else {
    console.log('Tables in DynamoDB:', data.TableNames);
  }
});


// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'dist')));
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

// Get all transactions
app.get('/api/transactions', async (req, res) => {
    
    const params = {
        TableName: 'AvaronRhoTransactions',
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        res.json(data.Items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to get the current balance
async function getCurrentBalance() {
    const params = {
        TableName: 'AvaronRhoTransactions',
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        const transactions = data.Items;

        // Calculate the current balance
        let currentBalance = 0;

        transactions.forEach(transaction => {
            const chargeAmount = parseFloat(transaction.chargeAmount) || 0;
            const serviceFee = parseFloat(transaction.serviceFee) || 0;
            const otherFees = parseFloat(transaction.otherFees) || 0;
            currentBalance += chargeAmount - (serviceFee + otherFees);
        });

        return currentBalance;
    } catch (err) {
        throw new Error('Could not retrieve current balance');
    }
}

// Endpoint to get the current balance
app.get('/api/current-balance', async (req, res) => {
    try {
        const currentBalance = await getCurrentBalance(); // Call the new function
        res.status(200).json(currentBalance); // Return just the balance
    } catch (err) {
        res.status(500).json({ error: 'Could not retrieve current balance' });
    }
});

app.post('/api/transactions', async (req, res) => {
    const { date, source, initialAmount, serviceFee, otherFees } = req.body;

    // Validate inputs
    if (isNaN(initialAmount) || isNaN(serviceFee) || isNaN(otherFees)) {
        return res.status(400).json({ error: 'Initial amount, service fee, and other fees must be numbers' });
    }

    const chargeAmount = initialAmount - (serviceFee + otherFees);

    let currentBalance = 0; // Default to 0
    try {
        currentBalance = await getCurrentBalance(); // Call to get current balance
    } catch (error) {
        console.error('Error getting current balance:', error);
        // Proceed with currentBalance = 0
    }

    // Calculate the running balance
    const runningBalance = currentBalance + chargeAmount; 

    const params = {
        TableName: 'AvaronRhoTransactions',
        Item: {
            id: new Date().getTime().toString(),
            date,
            chargeAmount,
            source,
            initialAmount,
            serviceFee,
            otherFees,
            runningBalance,
        },
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(201).json({ message: 'Transaction added' });
    } catch (err) {
        console.error('Error adding transaction:', err);
        res.status(500).json({ error: 'Could not add transaction', details: err.message });
    }
});



// Endpoint to delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const params = {
        TableName: 'AvaronRhoTransactions',
        Key: {
            id,
        },
    };
    try {
        await dynamoDB.delete(params).promise();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Could not delete transaction' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});