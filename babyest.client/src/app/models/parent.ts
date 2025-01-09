export interface Parent {
    Id : number;
    Email : string;
    Kids : KidsOfParent[];
}

export interface KidsOfParent {
    KidId : number;
    KidName : string;
    Parents : string[];
}
