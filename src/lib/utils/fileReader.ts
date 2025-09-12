import fs from 'fs';
import * as csv from '@fast-csv/parse';
import type { CSVRowData, ParseResponse } from '../types/index.js';
import { parse, isValid } from 'date-fns';
import AccountManager from './classes/AccountManager.js';
import Transaction from './classes/Transaction.js';
import logger from './logger.js';

const readData = (fileName: string, accountManager: AccountManager): Promise<AccountManager> => {

    return new Promise((res) => {
        logger.debug("Started Reading CSV File")
        fs.createReadStream(`./src/lib/CSV/${fileName}`)
            .pipe(csv.parse({ headers: headers => headers.map(header => header?.toLowerCase()) }))
            .on('error', error => console.error(error))
            .on('data', (row: CSVRowData) => {
                const { data, error } = parseCSVRowData(row);
                if (error) {
                    logger.error(error)
                } else if (data) {
                    const newTransaction = new Transaction(data)
                    accountManager.updateAccounts([data.from,data.to], newTransaction)
                } else {
                    logger.error("No Data Found - Unknown Error")
                }
            })
            .on('end', () => {
                accountManager.updateAccountBalances();
                logger.debug("Finished Reading CSV File")
                res(accountManager);
            });
    })
}

/**
 * Parses date to a Date object and amount to a Number
 * @param CSVRowData 
 * @returns ParsedResponse Object
 */
const parseCSVRowData = ({ date, from, to, narrative, amount}: CSVRowData): ParseResponse => {
    const parsedData = { 
        date: parse(date, "dd/MM/yyyy", new Date()),
        from,
        to,
        narrative,
        amount: Number(amount)
    };
    
    if (!isValid(parsedData.date)) { 
        return { data: parsedData, error: `${date} is not a valid Date` }; 
    }

    if (isNaN(parsedData.amount)) { 
        return { data: parsedData, error: `${amount} is not a valid amount` }; 
    }
    
    return { data: parsedData, error: null };
}

export default readData;