/**
 *  This NotificationControl.js checks for notification messages
 *  from both the Server side and client side.
 *  
 *  It is the last script to be run by every page that loads
 *  so it can properly check for notifications.
*/

import { DeletePageVariable, GetPageVariable, SavePageVariable, g_ClientSideNotificationKey } from "../structures/PagePersistentVariables.js";
import {Requestor} from "../structures/Requestor.js";
import {Utility} from "../structures/Utility.js";



function CreateNotificationRibbon()
{
    let notificationElement = document.createElement("div");
    notificationElement.id = "NotificationRibbon";
    notificationElement.classList.add("Invisible");
    notificationElement.innerHTML = "<p id='NotificationRibbonMessageArea'></p>";
    document.body.appendChild(notificationElement);
}

function ShowRibbon()
{
    // console.log("Show Ribbon Called!");
    let ribbonHandle = document.getElementById("NotificationRibbon");
    ribbonHandle.classList.replace("Invisible", "Visible");
}

function HideRibbon()
{
    // console.log("Hide Ribbon Called!");
    let ribbonHandle = document.getElementById("NotificationRibbon");
    ribbonHandle.classList.replace("Visible", "Invisible");
}

function DisplayNotificationMessage(data, timeoutElapse=5000)
{
    // console.log(data);
    // console.log(data['user_notification']);
    // console.log(typeof(data['user_notification']));

    
    let msgObj = JSON.parse(data['user_notification']);
    let status = msgObj['status'];
    
    let ribbonHandle = document.getElementById("NotificationRibbon");
    let ribbonHandleMessage = document.getElementById("NotificationRibbonMessageArea");

    ribbonHandleMessage.innerText = msgObj['message'];

    switch (status)
    {
        case "good":
            ribbonHandle.style.color = "green";
            break;
        case "okay":
            ribbonHandle.style.color = "white";
            break;
        case "bad":
            ribbonHandle.style.color = "red";
            break;
    }

    ShowRibbon();
    //  Remove Ribbon after 5 Seconds by default
    setTimeout(HideRibbon, timeoutElapse);
}

async function FetchNotificationMessage()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeUserNotification.php";
    let data = await rq.SendGet(url, "json", {});
    DisplayNotificationMessage(data);
}

function RibbonDisplayMessage(msgObj, timeout=5000)
{
    let ribbonHandle = document.getElementById("NotificationRibbon");
    let ribbonHandleMessage = document.getElementById("NotificationRibbonMessageArea");
    // document.getElementById("NotificationRibbon").style.display = "block";
    
    // console.log("Ribbon Display Message: ", msgObj['message']);

    ribbonHandleMessage.innerText = msgObj['message'];

    switch (msgObj['status'])
    {
        case "good":
            ribbonHandle.style.color = "green";
            break;
        case "okay" || "ok":
            ribbonHandle.style.color = "white";
            break;
        case "bad":
            ribbonHandle.style.color = "red";
            break;
    }

    ShowRibbon();
    //  Remove Ribbon after 3 Seconds
    setTimeout(HideRibbon, timeout);
}

function SaveClientMessageAsPageVariable(msgObj)
{
    SavePageVariable(g_ClientSideNotificationKey, msgObj);
}

/**
 *  This function is also called by every page that includes the NotificationControl
 */
function DisplayClientSideNotification(timeout=5000)
{
    // let pageParams = new URLSearchParams(document.location.search);
    // console.log("Page Params: ", pageParams);
    // let msg = pageParams.get('ClientNotificationMessage');
    let msgObj = GetPageVariable(g_ClientSideNotificationKey);
    if (msgObj != null){
        // console.log("Message Printed!");
        // let util = new Utility();
        // let msgObject = util.NotificationMessageSplit(msg);
        RibbonDisplayMessage(msgObj, timeout);
        //  Empty the client-side notification
        DeletePageVariable(g_ClientSideNotificationKey);
    }
}


const NotificationControl = ()=>
{
    CreateNotificationRibbon();
    // console.log("Notification Control Active!");
    //  Run The server-side notificiation script after given lag
    //  so that the client-side notificaiton can show
    //  For some reason, await is not needed here
    setTimeout(FetchNotificationMessage, 5000);
}

NotificationControl();


export {RibbonDisplayMessage, DisplayClientSideNotification, SaveClientMessageAsPageVariable};