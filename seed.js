const { dynamoDB } = require('./dist/js/database');

async function seedData() {
    const transactions = [
        {
            id: Date.now().toString(), // Use timestamp for unique ID
            date: '2024-09-25',
            chargeAmount: 1500,
            source: 'Quest Reward',
            serviceFeePercentage: 20, // Include service fee percentage
            otherFees: 200,
        },
        {
            id: (Date.now() + 1).toString(), // Ensure unique ID
            date: '2024-09-24',
            chargeAmount: -500,
            source: 'Purchase - Equipment'
        }
    ];

    let runningTotal = 0; // Start running total at 0

    for (const transaction of transactions) {
        // Convert chargeAmount and otherFees to numbers
        const chargeAmountNum = parseFloat(transaction.chargeAmount);
        const otherFeesNum = parseFloat(transaction.otherFees);
        
        // Calculate service fee
        const serviceFee = (transaction.serviceFeePercentage / 100) * chargeAmountNum;

        // Calculate final amount and update running total
        const finalAmount = chargeAmountNum - (serviceFee + otherFeesNum);
        runningTotal += finalAmount; // Update the running total

        const params = {
            TableName: 'AvaronRhoTransactions',
            Item: {
                id: transaction.id,
                date: transaction.date,
                chargeAmount: chargeAmountNum,
                source: transaction.source,
                runningTotal: runningTotal.toFixed(2), // Store running total
                initialAmount: chargeAmountNum, // Initial amount is the same as charge amount
                serviceFee: serviceFee.toFixed(2), // Store service fee
                otherFees: otherFeesNum.toFixed(2), // Store other fees
                finalAmount: finalAmount.toFixed(2), // Store final amount
            },
        };

        try {
            await dynamoDB.put(params).promise();
            console.log(`Transaction added: ${transaction.source}`);
        } catch (err) {
            console.error('Error adding transaction:', err.message);
        }
    }
}

seedData();
