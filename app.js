const express = require("express");
const app = express();
const hasura = require("./hasura");
const cors = require("cors");
app.use(cors());
app.use(express.json());

//Get Account

app.get("/api/account",async(req,res)=>{
    try {
        const { account_id } = req.query;
        const account = await hasura.getAccountFromHasura(account_id);
        res.status(200).send({ success: true, balance: account.balance });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
})

//Deposit Functionality

app.get('/api/deposit', async (req, res) => {
    const { account_id, amount } = req.query;

    try {
        // Get the account from Hasura
        const account = await hasura.getAccountFromHasura(account_id);

        // Update balance
        const newBalance = account.balance + parseInt(amount);

        // Insert transaction record and update balance
        await hasura.insertTransactionAndUpdateBalance(account_id, 'deposit', amount, newBalance);

        res.status(200).send({ success: true, balance: newBalance });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

//Withdraw Functionality

app.get('/api/withdraw', async (req, res) => {
    const { account_id, amount } = req.query;

    try {
        // Get the account from Hasura
        const account = await hasura.getAccountFromHasura(account_id);

        // Check if the account has enough balance
        if (account.balance < amount) {
            return res.status(400).send({ success: false, message: "Insufficient balance" });
        }

        // Update balance
        const newBalance = account.balance - amount;

        // Insert transaction record and update balance
        await hasura.insertTransactionAndUpdateBalance(account_id, 'withdrawal', amount, newBalance);

        res.status(200).send({ success: true, balance: newBalance });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

app.post('/api/dw', async (req, res) => {
    const { transactiontype } = req.query;
    const { account_id, amount } = req.body;
    try {
        if (transactiontype === "deposit") {
            res.redirect(`/api/deposit?account_id=${account_id}&amount=${amount}`);
        } else {
            res.redirect(`/api/withdraw?account_id=${account_id}&amount=${amount}`);
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});
//Transaction History

app.get('/api/transactions', async (req, res) => {
    const { account_id } = req.query;

    try {
        // Fetch transactions from Hasura
        const transactions = await hasura.getTransactionsFromHasura(account_id);
        res.status(200).send({ success: true, transactions });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});


app.listen(8080, () => {
    console.log("running at port 8080"); 
})