import * as fs from 'fs';
import * as csv from '@fast-csv/parse';
import * as readline from 'readline-sync'
import { format, parse } from 'date-fns';


const getData = (fileName: string): void => {
     fs.createReadStream(`./src/lib/CSV/${fileName}`)
        .pipe(csv.parse({ headers: headers => headers.map(header => header?.toLowerCase()) }))
        .on('error', error => console.error(error))
        .on('data', (row: CSVRowData) => {
            const data = parseCSVRowData(row);
            const newTransaction = new Transaction(data)
            transactions.push(newTransaction)
            getOrCreateAccount(data.from).addTransaction(newTransaction);
            getOrCreateAccount(data.to).addTransaction(newTransaction);
        })
        .on('end', () => {
            accounts.forEach(account => {
                account.calculateBalance()
            })
        });
}

const listAccounts = (): void => {
    accounts.forEach(account => console.log(account.toString()));
}

const listAccountTransactions = (accountName: string): void => {
    getOrCreateAccount(accountName).printTransactions();
}

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
        return `£${this.amount} for ${this.narrative} on the ${format(this.date, "do MM yyyy")}`;
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
                outputString = `(-) Paid ${transaction.from} `
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
    }

    toString() {
        return this.name + (this.balance >= 0 ? " is owed " : " owes ") + "£" + this.balance
    }
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

const transactions: Transaction[] = [];
const accounts: Account[] = [];

getData('Transactions2014.csv');
