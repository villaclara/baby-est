import { KidActivity } from "./kid-activity";

export interface Kid {
    Name : string;
    BirthDate : string;
    Activities : KidActivity[];
    Parents : string[];
}
