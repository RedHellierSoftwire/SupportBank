import Transaction from "./Transaction.js";

export default class Account {
    name: string;
    balance: number;
    transactions: Transaction[];

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
        return `${this.name} ${this.balance >= 0 ? "is owed" : "owes"} £ ${Math.abs(this.balance)}`;
    }
}
