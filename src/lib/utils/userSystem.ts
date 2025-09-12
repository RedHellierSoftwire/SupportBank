import * as readline from 'readline-sync';
import AccountManager from './classes/AccountManager.js'

export const promptUser = (accountManager: AccountManager): string => {
    // Ask for User Input
    console.log("What would you like to do?")
    console.log("> List All - Shows all accounts and current balances")
    console.log("> List [Account Name] - Shows all transactions linked to that account")
    console.log();
    const query = readline.question("Please enter your query: ").toLowerCase();
    console.log();
    const queryArray = query.split(" ");

    /* 
        If query is "List All" list all accounts
        If query is "List [Account Name]" AND account exists, list all transactions
        If query is "List [Account Name]" AND account does not exist, display no account found error
        If query is "Exit", exit system
        If none of the above, display unrecognised prompt error
    */ 
    if (query === "list all" || query === "l a") {
        accountManager.listAccounts();
    } else if (queryArray.length === 3 && (queryArray[0] === "list" || queryArray[0] === "l")) {
        const accountName: string = "" + queryArray.at(1)?.charAt(0).toUpperCase() + queryArray.at(1)?.slice(1) + " " + queryArray[2]?.toUpperCase();
        if (accountManager.doesAccountExist(accountName)) {
            accountManager.getAccount(accountName)?.printTransactions();
        } else {
            console.log(`No Account found for ${accountName}`);
        }
    } else if (query === "exit") {
        return "System Shut Down"
    } else {
        console.log(`${query} is not a recognised query`);
    }

    readline.question("")
    console.log()
    return promptUser(accountManager);
}