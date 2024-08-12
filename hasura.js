const axios = require('axios');
if(process.env.NODE_ENV = "production"){
    require('dotenv').config();
}
const HasuraURL = process.env.HasuraURL;
const HasuraAdminSecret = process.env.HasuraAdminSecret;
const getAccountFromHasura = async (account_id) => {
    const query = `
    query {
        accounts_by_pk(id: "${account_id}") {
            id
            balance
        }
    }`;

    const response = await axios.post(HasuraURL, { query }, { headers: { 'x-hasura-admin-secret': HasuraAdminSecret } });
    return response.data.data.accounts_by_pk;
};

const insertTransactionAndUpdateBalance = async (account_id, type, amount, newBalance) => {
    const mutation = `
    mutation {
        update_accounts_by_pk(pk_columns: {id: "${account_id}"}, _set: {balance: ${newBalance}}) {
            id
            balance
        }
        insert_transactions(objects: [{account_id: "${account_id}", type: "${type}", amount: ${amount}, balance_after_transaction: ${newBalance}}]) {
            affected_rows
        }
    }`;

    await axios.post(HasuraURL, { query: mutation }, { headers: { 'x-hasura-admin-secret': HasuraAdminSecret } });
};



const getTransactionsFromHasura = async (account_id) => {
    const query = `
    query {
        transactions(where: {account_id: {_eq: "${account_id}"}}) {
            id
            type
            amount
            created_at
            balance_after_transaction
        }
    }`;

    const response = await axios.post(HasuraURL, { query }, { headers: { 'x-hasura-admin-secret': HasuraAdminSecret } });
    // console.log(response.data);
    return response.data.data.transactions;
};
module.exports ={
    insertTransactionAndUpdateBalance,
    getTransactionsFromHasura,
    getAccountFromHasura
}