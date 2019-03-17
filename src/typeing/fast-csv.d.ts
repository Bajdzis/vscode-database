declare module 'fast-csv' {

    interface Setting {
        headers?: boolean;
        quoteHeaders?: boolean;
        quoteColumns?: boolean;
    }

    export function writeToString(data: any[], setting: Setting, callback: (error: Error, csv: string) => void): string;
}
