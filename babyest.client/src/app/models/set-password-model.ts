export class SetPasswordModel {
    secret: number;
    email: string;
    password: string;

    constructor(s: number, em: string, pw: string)
    {
        this.secret = s;
        this.email = em;
        this.password = pw;
    }
}
