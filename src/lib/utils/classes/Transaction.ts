import type { RowData } from "../../types/index.js";
import { format } from 'date-fns';

export default class Transaction {
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