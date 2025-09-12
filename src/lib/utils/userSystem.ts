import * as readline from 'readline-sync';
import AccountManager from './classes/AccountManager.js'

const runSystem = (accountManager: AccountManager) => {
    // Ask for User Input
    console.log("What would you like to do?")
    console.log("> List All - Shows all accounts and current balances")
    console.log("> List [Account Name] - Shows all transactions linked to that account")
    console.log();
    const query = readline.question("Please enter your query: ").toLowerCase();
    console.log();
    const queryArray = query.split(" ");
    const queryCommand = queryArray[0];
    const queryParam = queryArray.slice(1).join(" ")

    /* 
        If query is "List All" list all accounts
        If query is "List [Account Name]" AND account exists, list all transactions
        If query is "List [Account Name]" AND account does not exist, display no account found error
        If query is "Exit", exit system
        If none of the above, display unrecognised prompt error
    */ 
    if (queryCommand === "list" || queryCommand === "l") {
        if (queryParam === "all" || queryParam === "a") {
            accountManager.listAccounts();
        } else {
            if (accountManager.doesAccountExist(queryParam)) {
                accountManager.getAccount(queryParam)?.printTransactions();
            } else {
                console.log(`No Account found for ${queryParam}`);
            }
        }
    } else if (queryCommand === "exit" || queryCommand === "e") {
        console.log("System Shutting Down")
        return
    } else {
        console.log(`${query} is not a recognised query`);
    }

    readline.question("")
    console.log()
    return runSystem(accountManager);
}

export default runSystem;