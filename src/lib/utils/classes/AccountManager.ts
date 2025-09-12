import Account from "./Account.js";
import type Transaction from "./Transaction.js";

export default class AccountManager {
    accounts: Account[];

    constructor() {
        this.accounts = [];
    }

    updateAccounts = (accountNames: string[], transaction: Transaction) => {
        accountNames.forEach(name => {
            const account = this.getAccount(name);
            if (!account) { 
                const newAccount = this.createAccount(name);
                newAccount.addTransaction(transaction);
                this.accounts.push(newAccount);
            } else {
                account.addTransaction(transaction);
            }
        })
    }

    updateAccountBalances = () => {
        this.accounts.forEach(account => {
            account.calculateBalance()
        })
    }

    doesAccountExist = (accountName: string): boolean => {
        const account = this.getAccount(accountName)
        return account !== undefined;
    }

    createAccount = (accountName: string): Account => {
        const newAccount = new Account(accountName);
        return newAccount;
    }

    getAccount = (accountName: string): Account | undefined => {
        return this.accounts.find(account => { return account.name === accountName })
    }

    listAccounts = (): void => {
        this.accounts.forEach(account => console.log(account.toString()));
    }
}