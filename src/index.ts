import fs from 'fs';
import * as csv from '@fast-csv/parse';
import * as readline from 'readline-sync';
import log4js from 'log4js';
import { format, isValid, parse } from 'date-fns';

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

const logger = log4js.getLogger();

// MAIN FUNCTIONS

const getData = (fileName: string): void => {

    // Start rowNumber from 2 to account for headers row - purely for logging purposes
    let rowNumber = 2;

     fs.createReadStream(`./src/lib/CSV/${fileName}`)
        .pipe(csv.parse({ headers: headers => headers.map(header => header?.toLowerCase()) }))
        .on('error', error => console.error(error))
        .on('data', (row: CSVRowData) => {
            const data = parseCSVRowData(row);
            if (typeof data === "string") {
                logger.debug(`Invalid Data on row ${rowNumber} - ${data}`);
            } else {
                const newTransaction = new Transaction(data)
                getOrCreateAccount(data.from).addTransaction(newTransaction);
                getOrCreateAccount(data.to).addTransaction(newTransaction);
            }
            rowNumber++;
        })
        .on('end', () => {
            // Update all balances
            accounts.forEach(account => {
                account.calculateBalance()
            })
            // Start System
            console.log(promptUser());
        });
}

const listAccounts = (): void => {
    accounts.forEach(account => console.log(account.toString()));
}

const promptUser = (): string => {
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

    console.log(queryCommand + " " + queryParam)

    /* 
        If query is "List All" list all accounts
        If query is "List [Account Name]" AND account exists, list all transactions
        If query is "List [Account Name]" AND account does not exist, display no account found error
        If query is "Exit", exit system
        If none of the above, display unrecognised prompt error
    */ 

    if (queryCommand === "list" || queryCommand === "l") {
        if (queryParam === "all" || queryParam === "a") {
            listAccounts();
        } else {
            if (doesAccountExist(queryParam)) {
                getOrCreateAccount(queryParam).printTransactions();
            } else {
                console.log(`No Account found for ${queryParam}`);
            }
        }
    } else if (queryCommand === "exit" || queryCommand === "e") {
        return "System Shutting Down"
    } else {
        console.log(`${query} is not a recognised query`);
    }

    readline.question("")
    console.log()
    return promptUser();
}

// TYPES and CLASSES

type CSVRowData = {
    date: string;
    from: string;
    to: string;
    narrative: string;
    amount: string;
}

type RowData = {
    date: Date;
    from: string;
    to: string;
    narrative: string;
    amount: number;
}

class Transaction {
    date: Date;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor({ date, from, to, narrative, amount }: RowData) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = amount;
    }

    toString() {
        return `£${this.amount} for ${this.narrative} on the ${format(this.date, "do MMM yyyy")}`;
    }
}

class Account {
    name: string;
    balance: number;
    transactions: Array<Transaction>;

    constructor(name: string) {
        this.name = name;
        this.balance = 0;
        this.transactions = [];
    }

    addBalance(transactionAmount: number) : void {
        this.balance += transactionAmount;
    }

    deductBalance(transactionAmount: number): void {
        this.balance -= transactionAmount;
    }

    addTransaction(transaction: Transaction): void {
        this.transactions.push(transaction);
    }

    printTransactions(): void {
        this.transactions.forEach(transaction => {
            let outputString;
            if (transaction.to === this.name) {
                outputString = `(+) Was Paid by ${transaction.from} `
            } else if (transaction.from === this.name) {
                outputString = `(-) Paid ${transaction.to} `
            }
            outputString += transaction.toString();
            console.log(outputString);
        })
    }

    calculateBalance(): void {
        this.transactions.forEach(transaction => {
            if (transaction.to === this.name) {
                this.addBalance(transaction.amount);
            } else if (transaction.from === this.name) {
                this.deductBalance(transaction.amount);
            }
        })
        this.balance = Math.round(this.balance*100)/100
    }

    toString() {
        return this.name + (this.balance >= 0 ? " is owed " : " owes ") + "£" + Math.abs(this.balance);
    }
}

// UTIL FUNCTIONS

const doesAccountExist = (accountName: string): boolean => {
    return accounts.find(account => { return account.name.toLowerCase() === accountName.toLowerCase() }) !== undefined;
}

/**
 * Gets the account by name, or if one does not exist, creates an account and returns that
 * @param accountName
 * @returns Either the account if found OR a newly created account
 */
const getOrCreateAccount = (accountName: string): Account => {
    const account = accounts.find(account => { return account.name.toLowerCase() === accountName.toLowerCase() });
    if (!account) {
        const newAccount = new Account(accountName);
        accounts.push(newAccount);
        return newAccount;
    }

    return account;
}

/**
 * Parses date to a Date object and amount to a Number
 * @param CSVRowData 
 * @returns Parsed RowData OR false if data cannot be parsed
 */
const parseCSVRowData = ({ date, from, to, narrative, amount}: CSVRowData): RowData | string => {
    const parsedData = {
        date: parse(date, "dd/MM/yyyy", new Date()),
        from,
        to,
        narrative,
        amount: Number(amount)
    };

    if (!isValid(parsedData.date)) { return `${date} is not a valid Date`; }
    if (isNaN(parsedData.amount)) { return `${amount} is not a valid amount`; }

    return parsedData;
}


// Run Script
const accounts: Account[] = [];
getData('DodgyTransactions2015.csv');
