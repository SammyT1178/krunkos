const AWS = require('aws-sdk');

// Configure AWS SDK (set your region)
AWS.config.update({
    region: 'us-east-2', // Replace with your region
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
 
const dynamoDB = new AWS.DynamoDB.DocumentClient();
module.exports = { dynamoDB }; // Export the client for use in other files