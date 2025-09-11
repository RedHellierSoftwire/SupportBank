import * as fs from 'fs';
import * as csv from '@fast-csv/parse'
import { format } from 'date-fns';

const ListAll = (filePath: string) => {

}

type RowData = {
    Date: string;
    From: string;
    To: string;
    Narrative: string;
    Amount: string;
}

class Account {
    name: string;
    balance: number;

    constructor(name: string) {
        this.name = name;
        this.balance = 0;
    }

    addBalance(transactionAmount: number) : void {
        this.balance += transactionAmount;
    }

    deductBalance(transactionAmount: number): void {
        this.balance -= transactionAmount;
    }
}
class Transaction {
    date: string;
    from: string;
    to: string;
    narrative: string;
    amount: number;

    constructor(data: RowData) {
        this.date = format(data.Date, "yyyy/MM/dd");
        this.from = data.From;
        this.to = data.To;
        this.narrative = data.Narrative;
        this.amount = Number(data.Amount);

    }
}


const transactions: Array<Transaction> = [];
const accounts: Array<Account> = [new Account("Dan W")];

fs.createReadStream('./src/lib/Transactions2014.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', (row: RowData) => {
        getOrAddAccount(row.From);
        getOrAddAccount(row.To);
        const newTransaction = new Transaction(row)
        transactions.push(newTransaction)
    })
    .on('end', (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

const getOrAddAccount = (accountName: string): Account => {
    const account = accounts.find(account => { return account.name === accountName });
    if (!account) {
        const newAccount = new Account(accountName);
        accounts.push(newAccount);
        return newAccount;
    }

    return account;
}
