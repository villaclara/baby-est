export interface KidActivity {
    Id : number;
    ActivityType : string;
    StartDate : Date | undefined;
    EndDate : Date | undefined;
    IsActiveNow: boolean;
    KidName : string;
}
