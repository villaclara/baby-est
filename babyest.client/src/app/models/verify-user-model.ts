export class VerifyUserModel {
    email: string = '';
    kidName?: string;
    kidBirth: Date = new Date();

    constructor(em: string, birth: Date, kname?: string) {
        this.email = em;
        this.kidName = kname;
        this.kidBirth = birth;
    }
}
