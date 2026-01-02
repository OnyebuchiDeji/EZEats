import {VerifyDatabaseTablesExist} from "./PageControl.js";

const RegisterPageScript = async ()=>{
    await VerifyDatabaseTablesExist();
    // console.log("Register Page Script Ran!");

};


RegisterPageScript();