/**
 * 
 * MainPage Displays Shopping Categories or Sections
 */

// import { SavePageVariable, g_UserInfoKey } from "../structures/PagePersistentVariables.js";
import {Requestor} from "../structures/Requestor.js";
import {Utility} from "../structures/Utility.js";
import { DisplayClientSideNotification } from "./NotificationControl.js";
// import {VerifyDatabaseTablesExist} from "./PageControl.js";


function CategoryElementOnClick(categoryName){
    //  This will be the MainPage
    let currentUrl = window.location.href;
    let index = currentUrl.indexOf("MainPage.html");
    let newUrl = currentUrl.slice(0, index);
    newUrl += "CategoryPage.html?" +
        new URLSearchParams({categoryName : String(categoryName)});
    // console.log("New URL: ", newUrl);
    window.location.href = newUrl;
}

function LoadCategoryContent(data)
{
    // let dataArr = JSON.parse(JSON.stringify(data));
    let dataCategoryArray = data['category_array'];
    let dataFrequencyArray = data['frequency_array'];
    // console.log("LoadCategory Data: ", data);
    let mainContentHandle = document.getElementById("MainContentHTML");
    mainContentHandle.classList.add("category-list");

    let util = new Utility();

    dataCategoryArray.forEach((name, index)=>{
        let categoryElement = document.createElement("div");
        categoryElement.classList.add("CategoryElement");
        categoryElement.classList.add("category-item");
        categoryElement.classList.add("category-banner");

        let textBanner = document.createElement("span");
        textBanner.classList.add("category-name");

        textBanner.innerText = util.Capitalize(name);

        let frequency = document.createElement("span");
        frequency.classList.add("category-badge");
        frequency.innerText = dataFrequencyArray[index];

        let arrow = document.createElement("span");
        arrow.classList.add("category-arrow");
        arrow.innerText = "→";

        
        categoryElement.onclick = ()=>{
            CategoryElementOnClick(name);
        }
        categoryElement.appendChild(textBanner);
        categoryElement.appendChild(frequency);
        categoryElement.appendChild(arrow);
        
        mainContentHandle.appendChild(categoryElement);
    });    
}

async function FetchCategoryContent()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeCategories.php";
    const data = await rq.SendPost(url, "json", "json", {});
    LoadCategoryContent(data);
}

async function RequestDatabaseSetup()
{
    //  First Check if Tables Exist:
    let rq = new Requestor();
    let url = "../../_server/_configure/VerifyDatabaseTablesExist.php";
    const resAsJson = await rq.SendPost(url, "json", "json");

    if (resAsJson['status'] == false)
    {
        let rq = new Requestor();
        let url = "../../_server/system_semantics/systems/SetupDatabase.php";
        let data = await  rq.SendPost(url, "json", "text", {'mode':"create-captcha-table"});
        // console.log(data);
        
        rq = new Requestor();
        url = "../../_server/system_semantics/systems/SetupDatabase.php";
        data = await rq.SendPost(url, "json", "text", {'mode':"create-grocery-table"});
        // console.log(data);

        rq = new Requestor();
        url = "../../_server/system_semantics/systems/SetupDatabase.php";
        data = await rq.SendPost(url, "json", "text", {'mode':"create-orders-table"});
        // console.log(data);

        rq = new Requestor();
        url = "../../_server/system_semantics/systems/SetupDatabase.php";
        data = await rq.SendPost(url, "json", "text", {'mode':"create-customers-table"});
        // console.log(data);
    }
    // console.log("All Databases Exist!");
}


const MainPageScript = async ()=>
{
    DisplayClientSideNotification();
    await RequestDatabaseSetup();
    await FetchCategoryContent();
    // console.log("Main Loaded!");
}


// document.body.addEventListener("DOMContentLoaded", main);
// export default MainPage;
MainPageScript();