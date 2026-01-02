/**
 *  This script makes certain requests to the Server to
 *  get user information, like name, email, phone number, as well as to check
 *  if the current user is indeed an admin.
 * 
 *  It then populates unique parts of the Page's UI to show the current
 *  logged-in user, and, in the case of that user being an admin, it will
 *  give the option to go to the admin page.
*/


import {Requestor} from "../structures/Requestor.js";
import {Utility} from "../structures/Utility.js";

// let Parser = new DOMParser();
// let UserInfo = {};


function UpdateUserDetailsElement(data)
{
    //  User Details Element Handle
    let udh = document.getElementById("UserInfoElement");

    //  Modify the UDH icon
    //  This is the proper way to remove a child element.
    //  Cannot do udh.removeChild(udh.firstChild);
    //  ...for some reason.
    let firstChildHandle = udh.children[0]; //  the summary child element
    udh.removeChild(firstChildHandle);

    let util = new Utility();
    
    let newSummaryElement = document.createElement("summary");
    newSummaryElement.id = "UserInfoInitials";
    newSummaryElement.classList.add("nav-icon");
    newSummaryElement.classList.add("user-menu-summary");
    //  Note the height: max-content and line-height: max-content
    //  to vertically align the initials1
    newSummaryElement.innerHTML = `
        <div class="user-icon-wrapper">
            <span style="font-size: medium; height:max-content; line-height:max-content;" class="user-icon">${util.GetInitials(data['firstname'], data['lastname'], true)}</span>
        </div>
    `;
    udh.prepend(newSummaryElement);

    /**
     *  this is the ul element --- the second child of the udg element
     *  modify its values.
     *  Source: https://stackoverflow.com/questions/9249359/vertically-align-text-within-a-div
     */
    let udhUl = udh.children[1];    //  this is an element reference!
    let optionalHeader = document.createElement("li");
    optionalHeader.classList.add("dropdown-header");
    optionalHeader.innerHTML = `
        <h3 class="dropdown-header-title">${data['username']}</h3>
        <p class="dropdown-header-subtitle">Manage your profile and settings</p>
    `;
    
    let adminLinkElement = document.createElement("li");
    adminLinkElement.classList.add("user-menu-item");
    adminLinkElement.innerHTML = `
        <a href="../admin_interface/AdminCommand.html" class="user-menu-link">
            <span class="menu-link-text">Admin Dashboard</span>
        </a>
    `;

    let userInfo  = document.createElement("li");
    userInfo.classList.add("user-menu-item");
    userInfo.innerHTML = `
        <div class="user-info-text">
            <span class="user-name">${data['firstname']} ${data['lastname']}</span>
            <span class="user-role">email:${data['email']}</span>
            <span class="user-role">phone:${data['phone']}</span>
        </div>
    `;

    if (data['is_admin'])
    {
        udhUl.prepend(adminLinkElement);
    }
    
    udhUl.prepend(userInfo);
    udhUl.prepend(optionalHeader);
}

function RegisterDetailsOnUnfocusEvent()
{
    let detailElements = document.getElementsByTagName("details");
    for (let i=0; i< detailElements.length; i++)
    {   
        //  remove the attribute name 'open' that's automatically added to that `details` element
        detailElements[i].addEventListener('focusout', (e)=>
        {
            //  Source: https://danburzo.ro/focus-within/
            //  This way, the details element is not closed
            //  when an element inside it is focused on!
            if (e.currentTarget.contains(e.relatedTarget)) {
                /* Focus will still be within the container */
            } else {
                /* Focus will leave the container */
                detailElements[i].open = "";
            }
        });
    }
}

async function RequestUserInfo()
{

    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeUserSessionInfo.php";
    const data = await rq.SendPost(url, "json", "json", {});
    // SavePageVariable(g_UserInfoKey, data);
    //  The session data must be > 1 because the user notification will be there!
    if (Object.keys(data).length > 1)
    {
        UpdateUserDetailsElement(data)
    }

    RegisterDetailsOnUnfocusEvent();
}


const UserDetailsScript = async () =>
{
    await RequestUserInfo();
}


// UserDetailsScript();
export {UserDetailsScript}