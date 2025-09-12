export type CSVRowData = {
    date: string;
    from: string;
    to: string;
    narrative: string;
    amount: string;
}

export type RowData = {
    date: Date;
    from: string;
    to: string;
    narrative: string;
    amount: number;
}