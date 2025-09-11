import * as fs from 'fs';
import * as csv from '@fast-csv/parse';
import * as readline from 'readline-sync'
import { format, parse } from 'date-fns';

// MAIN FUNCTIONS

const getData = (fileName: string): void => {
     fs.createReadStream(`./src/lib/CSV/${fileName}`)
        .pipe(csv.parse({ headers: headers => headers.map(header => header?.toLowerCase()) }))
        .on('error', error => console.error(error))
        .on('data', (row: CSVRowData) => {
            const data = parseCSVRowData(row);
            const newTransaction = new Transaction(data)
            getOrCreateAccount(data.from).addTransaction(newTransaction);
            getOrCreateAccount(data.to).addTransaction(newTransaction);
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

    /* 
        If query is "List All" list all accounts
        If query is "List [Account Name]" AND account exists, list all transactions
        If query is "List [Account Name]" AND account does not exist, display no account found error
        If query is "Exit", exit system
        If none of the above, display unrecognised prompt error
    */ 
    if (query === "list all" || query === "l a") {
        listAccounts();
    } else if (queryArray.length === 3 && (queryArray[0] === "list" || queryArray[0] === "l")) {
        const accountName: string = "" + queryArray.at(1)?.charAt(0).toUpperCase() + queryArray.at(1)?.slice(1) + " " + queryArray[2]?.toUpperCase();
        if (doesAccountExist(accountName)) {
            getOrCreateAccount(accountName).printTransactions();
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
    return accounts.find(account => { return account.name === accountName }) !== undefined;
}

/**
 * Gets the account by name, or if one does not exist, creates an account and returns that
 * @param accountName
 * @returns Either the account if found OR a newly created account
 */
const getOrCreateAccount = (accountName: string): Account => {
    const account = accounts.find(account => { return account.name === accountName });
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
 * @returns Parsed RowData
 */
const parseCSVRowData = ({ date, from, to, narrative, amount}: CSVRowData): RowData => {
    return { 
        date: parse(date, "dd/MM/yyyy", new Date()),
        from,
        to,
        narrative,
        amount: Number(amount)
    };
}


// Run Script

const accounts: Account[] = [];
getData('Transactions2014.csv');
