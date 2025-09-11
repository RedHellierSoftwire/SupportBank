import * as fs from 'fs';
import * as csv from '@fast-csv/parse';
import * as readline from 'readline-sync'
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';


const getData = (fileName: string): void => {
     fs.createReadStream(`./src/lib/CSV/${fileName}`)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', (row: RowData) => {
            const newTransaction = new Transaction(row)
            transactions.push(newTransaction)
            getOrAddAccount(row.From).addTransaction(newTransaction);
            getOrAddAccount(row.To).addTransaction(newTransaction);
        })
        .on('end', () => {
            accounts.forEach(account => {
                account.calculateBalance()
            })
        });
    
    console.log("afterfs in getData")
}

const listAccounts = (): void => {
    accounts.forEach(account => console.log(account.toString()))
}

const listAccountTransactions = (accountName: string): void => {

}

type RowData = {
    Date: string;
    From: string;
    To: string;
    Narrative: string;
    Amount: string;
}

class Transaction {
    date: string;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor(data: RowData) {
        this.date = format(data.Date, "MM/dd/yyyy", { locale: enGB });
        this.from = data.From;
        this.to = data.To;
        this.narrative = data.Narrative;
        this.amount = Number(data.Amount);

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
const getOrAddAccount = (accountName: string): Account => {
    const account = accounts.find(account => { return account.name === accountName });
    if (!account) {
        const newAccount = new Account(accountName);
        accounts.push(newAccount);
        return newAccount;
    }

    return account;
}

const transactions: Array<Transaction> = [];
const accounts: Array<Account> = [];

getData('Transactions2014.csv');
console.log(accounts.length)
listAccounts();
