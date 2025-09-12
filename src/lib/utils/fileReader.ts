import fs from 'fs';
import * as csv from '@fast-csv/parse';
import type { CSVRowData, RowData } from '../types/index.js';
import { parse } from 'date-fns';
import AccountManager from './classes/AccountManager.js';
import Transaction from './classes/Transaction.js';

const readData = async (fileName: string, accountManager: AccountManager) => {
     fs.createReadStream(`./src/lib/CSV/${fileName}`)
        .pipe(csv.parse({ headers: headers => headers.map(header => header?.toLowerCase()) }))
        .on('error', error => console.error(error))
        .on('data', (row: CSVRowData) => {
            const data = parseCSVRowData(row);
            const newTransaction = new Transaction(data)
            accountManager.updateAccounts([data.from,data.to], newTransaction)
        })
        .on('end', () => {
            // Update all balances
            accountManager.updateAccountBalances();
            // Start System
            console.log();
        });
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