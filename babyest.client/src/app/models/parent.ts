export interface Parent {
    Id : number;
    Email : string;
    Kids : KidsOfParent[];
}

export interface KidsOfParent {
    kidId : number;
    kidName : string;
}
