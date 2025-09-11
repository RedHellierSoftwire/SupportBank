import * as fs from 'fs';
import * as csv from '@fast-csv/parse'
import { format } from 'date-fns';


const getData = (fileName: string): void => {
    fs.createReadStream(`./src/lib/CSV/${fileName}`)
        .pipe(csv.parse({ headers: true }))
        .on('error', error => console.error(error))
        .on('data', (row: RowData) => {
            getOrAddAccount(row.From);
            getOrAddAccount(row.To);
            const newTransaction = new Transaction(row)
            transactions.push(newTransaction)
        })
        .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));
}

const listAccounts = (): void => {

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
        this.date = format(data.Date, "MM/dd/yyyy");
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

    calculateBalance(): void {
        this.transactions.forEach(transaction => {
            if (transaction.to === this.name) {
                this.addBalance(transaction.amount);
            } else if (transaction.from === this.name) {
                this.deductBalance(transaction.amount);
            }
        })
    }
}


const transactions: Array<Transaction> = [];
const accounts: Array<Account> = [new Account("Dan W")];



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
