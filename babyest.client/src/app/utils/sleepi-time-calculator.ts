import { KidActivity } from "../models/kid-activity";

export class SleepiTimeCalculator {

    private backupActivities: KidActivity[];

    constructor(acts: KidActivity[]) {
        this.backupActivities = acts;
    }

    setBackupActivities(acts: KidActivity[]): void {
        this.backupActivities = acts;
    }

    calculateAverageTimes(daysCount: number, fromDate: Date): { avgSleepDay: number, avgSleepNight: number } {
        // average times calculation section
        let daySpan: number = daysCount; 
        let dates: Date[] = [];
        let sleepsForDay: number[] = Array(daySpan).fill(0);
        let sleepsforNight: number[] = Array(daySpan).fill(0);

        // fill array of dates for the month before
        for (let i = 0; i < daySpan; i++) {
            const tod = new Date(fromDate);
            tod.setDate(tod.getDate() - i);
            dates.push(tod);
        }

   

        // do checks if date matches and add to the sleep time for day/night element of array
        for (let i = 0; i < dates.length; i++) {
            for (let j = 0; j < this.backupActivities.length; j++) {
                // let elStart = new Date(this.backupActivities[j].StartDate!);
                // let elEnd = new Date(this.backupActivities[j].EndDate!);

                if (new Date(this.backupActivities[j].StartDate!).toDateString() === new Date(dates[i]).toDateString()) {
                    let elStart = new Date(this.backupActivities[j].StartDate!);
                    let elEnd = new Date(this.backupActivities[j].EndDate!);
                    if (this.backupActivities[j].IsActiveNow) {
                        sleepsForDay[i] += Math.floor((new Date().getTime() - elStart.getTime()) / 1000);

                        if (new Date(this.backupActivities[i].StartDate!).getHours() >= 19 || new Date(this.backupActivities[j].StartDate!).getHours() <= 8) {
                            sleepsforNight[i] += Math.floor((new Date().getTime() - elStart.getTime()) / 1000);
                        }
                        continue;
                    }

                    sleepsForDay[i] += Math.floor((elEnd.getTime() - elStart.getTime()) / 1000);
                    console.log('added sleepforday');
                    
                    if (new Date(this.backupActivities[j].StartDate!).getHours() >= 19 || new Date(this.backupActivities[j].StartDate!).getHours() <= 8) {
                        sleepsforNight[i] += Math.floor((elEnd.getTime() - elStart.getTime()) / 1000);
                    }
                }
            }
        }

        // calculating average times
        let sleepDayCount: number = 0;
        let sleepDayTotal: number = 0;
        let sleepNightCount: number = 0;
        let sleepNightTotal: number = 0;
        for (let i = 0; i < daySpan; i++) {
            if (sleepsForDay[i] != 0) {
                sleepDayCount++;
                sleepDayTotal += sleepsForDay[i];
            }

            if (sleepsforNight[i] != 0) {
                sleepNightCount++;
                sleepNightTotal += sleepsforNight[i];
            }
        }
        let avgSleepTimesFullday = Math.floor(sleepDayTotal / sleepDayCount);
        let avgSleepTimeNight = Math.floor(sleepNightTotal / sleepNightCount);

        return {
            avgSleepDay: avgSleepTimesFullday,
            avgSleepNight: avgSleepTimeNight
        }
    }

    // No need to pass the daySpan and fromDate params as we calculate total time only for last day
    calculateTotalTimes(): { totalSleepDay: number, totalSleepNight: number } {

        let totalSleepTimeNight: number = 0;
        let totalSleepTimeFullDay: number = 0;


        let toChangeSleepNight = true;
        // reset the value in time between 15.00 - 19.00
        if (new Date().getHours() < 19 && new Date().getHours() >= 15) {
            totalSleepTimeNight = 0;
            toChangeSleepNight = false;
        }

        const tod = new Date();
        let yst = new Date(tod);
        yst.setDate(yst.getDate() - 1);

        // filter the activities to get only for today and yesterday (yesterday hours more than current)
        let acts = this.backupActivities.filter(el => new Date(el.StartDate!).toDateString() == tod.toDateString()
            || (new Date(el.StartDate!).toDateString() == yst.toDateString() && new Date(el.StartDate!).getHours() >= tod.getHours()));


        acts.forEach(element => {

            // Sleeping and not active
            if (element.ActivityType.toLowerCase() === 'sleeping' && !element.IsActiveNow) {

                if (toChangeSleepNight) {

                    // if today is >19 hours, we want to get only todays sleep time starting more than 19
                    if (new Date(element.StartDate!).toDateString() == tod.toDateString() && new Date(element.StartDate!).getHours() >= 19) {
                        totalSleepTimeNight += Math.floor((new Date(element.EndDate!).getTime() - new Date(element.StartDate!).getTime()) / 1000);
                    }

                    // Sleep time Night -- yesterday > 19.00 && today <= 8 (startDate)
                    else if (new Date().getHours() < 19) {
                        if ((new Date(element.StartDate!).toDateString() == tod.toDateString() && new Date(element.StartDate!).getHours() <= 8)
                            || (new Date(element.StartDate!).toDateString() == yst.toDateString() && new Date(element.StartDate!).getHours() >= 19)) {
                            totalSleepTimeNight += Math.floor((new Date(element.EndDate!).getTime() - new Date(element.StartDate!).getTime()) / 1000);
                        }
                    }
                }

                // Sleep time Total doba
                totalSleepTimeFullDay += Math.floor((new Date(element.EndDate!).getTime() - new Date(element.StartDate!).getTime()) / 1000);
            }

            // Separate case when activity is active
            if (element.ActivityType.toLowerCase() === 'sleeping' && element.IsActiveNow) {
                if (toChangeSleepNight) {
                    totalSleepTimeNight += Math.floor((new Date().getTime() - new Date(element.StartDate!).getTime()) / 1000);
                }
                totalSleepTimeFullDay += Math.floor((new Date().getTime() - new Date(element.StartDate!).getTime()) / 1000);
            }

        });

        return {
            totalSleepDay: totalSleepTimeFullDay,
            totalSleepNight: totalSleepTimeNight
        }
    }

}
