import {RequestConnector} from "../structures/Requestor.js";
import {Utility} from "../structures/Utility.js";
import { SavePageVariable, GetPageVariable, g_ClientSideNotificationKey, g_AdminDisplayOutputContent} from "../structures/PagePersistentVariables.js";
import { RibbonDisplayMessage, SaveClientMessageAsPageVariable} from "../system_semantics/NotificationControl.js";


const InputApiPath = "../../_server/admin_semantics/input_apis/";
const OutputApiPath = "../../_server/admin_semantics/output_apis/";

/**
 *  First Function Run.
 *  It requests from the server to see if the user is an admin.
 *  If the user is an admin, it stays in this page. If not, it returns to main
 *  page with a message attached to GET, that the Notification Ribbon can
 *  parse to display.
 */
function VerifyIsAdmin()
{
    let rc = new RequestConnector();
    let url = "../../_server/admin_semantics/output_apis/ServeIsAdmin.php";
    rc.SendRequest(url, "get", "json", {}, (response)=>{
        // console.log("Verify Is Admin: ", response['is_admin']);
        if (response['is_admin'] != true){
            // let getParams = new URLSearchParams();
            let msg = {
                'status': "okay",
                'message': "You are not an administrator. You cannot access the admin webpage."
            };
            SaveClientMessageAsPageVariable(msg);
            // getParams.append("ClientNotificationMessage", `status:${msg['status']};message:${msg['message']}`);
            let newUrlEnpoint = "/system_interface/MainPage.html";
            let currentUrl = window.location.href;
            currentUrl = currentUrl.slice(0, currentUrl.indexOf("/admin_interface/AdminCommand.html"));
            newUrlEnpoint = currentUrl + newUrlEnpoint;
            window.location.href = newUrlEnpoint;
        }
        else{
            let msgObj = {'status': "good", 'message' : "Welcome Administrator!"};
            //  Access 
            RibbonDisplayMessage(msgObj);
        }
    });
}


/**
 * -------------------------------------------------------
 *                  Form and Console Semantics
 * -------------------------------------------------------
 */

/**
 *  Displays the data on the Console (Old Version)
 */
/**
function DisplayOutput(data)
{
    let consoleHandle = document.getElementById("Console");
    let util = new Utility();

    let displayContent = "";

    for (let idx=0; idx<data.length; idx++)
    {
        let data_item = data[idx];
        displayContent += 
        `
            <details class='AdminDisplayOutput'>
                <summary>Record ${idx} | ID ${data_item['id']}</summary>
                <ul>
        `;

        for (const [k, v] of Object.entries(data_item))
        {
            displayContent += `
                <li>${util.Capitalize(k)}: <b>${v}</b></li>
            `;
        }
        displayContent += `</ul>`; 
        displayContent += `</details>`;
    }
    consoleHandle.innerHTML = displayContent;
    SavePageVariable(g_AdminDisplayOutputContent, data);
}
*/

function DisplayOutput(data)
{
    let consoleHandle = document.getElementById("Console");
    let util = new Utility();

    consoleHandle.innerHTML = "";
    
    // let displayContent = "";
    let consoleDisplayList = document.createElement("ul");
    consoleDisplayList.classList.add("console-list");

    for (let idx=0; idx<data.length; idx++)
    {
        let dataListItem = document.createElement("li");
        dataListItem.classList.add("console-list-item");

        let data_item = data[idx];
        let listItemContentStr = `
            <details class="console-details">
                <summary class="console-summary">Record ${idx} | ID ${data_item['id']}</summary>
                <div class="console-details-content">
        `;

        for (const [k, v] of Object.entries(data_item))
        {
            listItemContentStr += `
                <strong>${util.Capitalize(k)}:</strong>${v}<br>
            `;
        }
        listItemContentStr += `</div>`; 
        listItemContentStr += `</details>`;
        dataListItem.innerHTML = listItemContentStr;
        consoleDisplayList.appendChild(dataListItem);
    }
    consoleHandle.appendChild(consoleDisplayList);
    SavePageVariable(g_AdminDisplayOutputContent, data);
}

function FormRequest(event)
{
    event.preventDefault();
    // console.log("Form Submitted!");

    // let callerId = event.target.id;
    let formElement = event.target;
    let formParams = new FormData(event.target);

    let url = "";

    // for (const [k, v] of Object.entries(formElement.elements)){
    //     formParams.append(k, v);
    // }

    let serverApiMode = formElement.dataset.targetMode;
    //  Append Mode Parameter to Form Data/Parameters
    formParams.append('mode', serverApiMode);
    let serverApiType = formElement.dataset.targetServerType;
    let serverApiName = formElement.dataset.targetServerScript;
    switch(serverApiType){
        case "Input":
            url = InputApiPath;
            break;
            case "Output":
                url = OutputApiPath;
                break;
    }
    
    url += serverApiName;
    if (!serverApiName.endsWith(".php")){
        url += ".php";
    }
    
    
    // console.log("Form Params: ", formParams);
    // console.log("Form Data: ");

    // console.log("JSON Object: ", JSON.stringify(formParams)) //  didn't work!
    //  So instead, construct an object!
    let obj = new Object();
    for (const pair of formParams.entries())
    {
        // console.log(pair[0], pair[1]);
        obj[pair[0]] = pair[1];
    }
    // console.log("JSON Object: ", obj);
    
    
    let rc = new RequestConnector();
    rc.SendRequest(url, "post", "json", obj,
        (info)=>{
            DisplayOutput(info)
        }
    );
}

//  Register The `FormRequest` callback to be called by the forms
function RegisterFormCallback()
{
    let commandForms = document.getElementsByClassName("AdminCommandForm");
    // console.log("Command Forms: ", commandForms)
    // console.log("Command Forms Array Size: ", commandForms.length)
    for (let i=0; i<commandForms.length; ++i)
    {
        let currentForm = commandForms[i];
        currentForm.addEventListener('submit', FormRequest);
    }
}

//  ------------------------------------------------------


/**
 *  This registers the buttons of class `FormVisiblityToggle`
 *  such that when they are clicked, they make toggle the visibility
 *  of their corresponding form simply by changing their class 
 */
function RegisterFormVisibleToggleButtons()
{
    let formToggleButtons = document.getElementsByClassName("FormVisibilityToggleButton");
    // console.log("Registering Form Toggle Buttons: ", formToggleButtons);

    for (let i=0; i<formToggleButtons.length; ++i)
    {
        let currentButton = formToggleButtons[i];
        currentButton.onclick = ()=>{
            // console.log("Current Button Target Form Element Id: ", currentButton.dataset.targetFormId + "Modal");
            //  note the html 'target-form-id' corresponds to this 'targetFormId'
            const formHandle = document.getElementById(currentButton.dataset.targetFormId + "Modal");
            if (!formHandle.classList.contains("active"))
            {
                openModal(currentButton.dataset.targetFormId);
            }
            else
            {
                closeModal(currentButton.dataset.targetFormId);
            }
        };
    }
}

// Modal control functions
function openModal(modalId) {
  const modal = document.getElementById(modalId + 'Modal');
  const overlay = document.getElementById('modalOverlay');
  
  if (modal && overlay) {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = modalId.includes("Modal") ? document.getElementById(modalId) : document.getElementById(modalId + 'Modal');
  const overlay = document.getElementById('modalOverlay');
  
  if (modal && overlay) {
    modal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function closeAllModals() {
  const modals = document.querySelectorAll('.admin-modal-form');
  const overlay = document.getElementById('modalOverlay');
  
  modals.forEach(modal => modal.classList.remove('active'));
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function RegisterCloseModalCallbacks()
{
    const closeModalButtons = document.querySelectorAll('.modal-close-btn');
    const closeModalCancelButtons = document.querySelectorAll('.form-cancel-btn');
    const modals = document.querySelectorAll('.admin-modal-form');

    for (let i=0; i<modals.length; i++)
    {
        closeModalButtons[i].addEventListener('click', ()=>{
            closeModal(modals[i].id);
        });
    
        closeModalCancelButtons[i].addEventListener('click', ()=>{
            closeModal(modals[i].id);
        });
    }

    const consoleModalOverlay = document.querySelector('.modal-overlay');
    consoleModalOverlay.addEventListener('click', closeAllModals);
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}


/**
 *  This loops through every form of class `AdminCommandForm`
 *  to add to their classlist the class 'Invisible'
 */
function HideAdminConmmandForms()
{
    let commandForms = document.getElementsByClassName("AdminCommandForm");

    for (let i=0; i<commandForms.length; ++i)
    {
        commandForms[i].classList.add("Invisible");
        // commandForms[i].classList.add("Visible");
    }
}

function InitDisplay()
{
    if (GetPageVariable(g_AdminDisplayOutputContent) != null)
    {
        DisplayOutput(GetPageVariable(g_AdminDisplayOutputContent));
    }
}

const AdminControlScript = ()=>
{
    VerifyIsAdmin();
    InitDisplay();
    HideAdminConmmandForms();
    RegisterFormVisibleToggleButtons();
    RegisterFormCallback();
    RegisterCloseModalCallbacks();
}

AdminControlScript();