/**
 * Holds functions in charge of checking if the user should view a page
 * If not, it redirects to the required page using Windows location
 */


import {Requestor} from "../structures/Requestor.js";


const VerifyDatabaseTablesExist = async (currentPageName = "")=>
{
    let rq = new Requestor();
    let url = "../../_server/_configure/VerifyDatabaseTablesExist.php";
    const resAsJson = await rq.SendPost(url, "json", "json", {});
    // console.log(resAsJson);
    if (resAsJson['status'] == false)
    {
        let currentUrl = window.location.href;
        let index = currentUrl.indexOf(`${currentPageName}`);
        let newUrl = currentUrl.slice(0, index);
        newUrl += "MainPage.html";
        // console.log("New URL: ", newUrl);
        window.location.href = newUrl;
        return;
    }
    // console.log("All Databases Exist!");
};


export {VerifyDatabaseTablesExist};