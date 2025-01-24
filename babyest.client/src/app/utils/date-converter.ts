import { Injectable } from "@angular/core";

@Injectable()
export class DateConverter {
    constructor() { }

    toHHmmString(date : Date) : string {
        const hh = new Date(date).getHours() < 10 ? "0" + new Date(date).getHours() : new Date(date).getHours();
        const mm = new Date(date).getMinutes() < 10 ? "0" + new Date(date).getMinutes() : new Date(date).getMinutes();
        let ddd = hh + ":" + mm;
        return ddd;
    }

    toDate(str : string) : Date {
        let y = new Date().getFullYear();
        let m = new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth();
        let d = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
        let ddd = y + "-" + m + "-" + d + "T" + str + ":00";
        return new Date(ddd);
    }

    shitDateToISOString(date: Date) : string {
        const y = new Date(date).getFullYear();
        const m = new Date(date).getMonth() < 9 ? "0" + (new Date(date).getMonth() + 1) : (new Date(date).getMonth() + 1);
        const d = new Date(date).getDate() < 10 ? "0" + new Date(date).getDate() : new Date(date).getDate();
        const hh = new Date(date).getHours() < 10 ? "0" + new Date(date).getHours() : new Date(date).getHours();
        const mm = new Date(date).getMinutes() < 10 ? "0" + new Date(date).getMinutes() : new Date(date).getMinutes();
        return y + "-" + m + "-" + d + "T" + hh + ":" + mm + ":00";
    }
}