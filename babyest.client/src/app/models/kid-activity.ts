export interface KidActivity {
    Id : number;
    ActivityType : string;  // 'sleeping', 'eatingLeft', 'eatingRight', 'eatingBoth', 'eathingBottle'
    StartDate : Date | undefined;
    EndDate : Date | undefined;
    IsActiveNow: boolean;
    KidName : string;
}
