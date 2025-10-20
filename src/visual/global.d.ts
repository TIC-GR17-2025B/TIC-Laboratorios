import { LogCategory } from './types/LogCategory';

declare global {
    type Log = {
        time: string;
        content: string;
        category: LogCategory;
    };
}

export {};