export class UserFormData {

    public email : string = "";
    public password : string = "";

    constructor(em : string, pw : string)
    {
        this.email = em;
        this.password = pw;
    }

}
