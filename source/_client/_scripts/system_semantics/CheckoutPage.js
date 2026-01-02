/**
 *  Will access the Saved Cart Array Structure and parse
 *  using JSON.parse()
 * 
 *  It will use this object to create an Order request
 *  to the ServerSide CreateOrder.
 * 
 *  It only has functions that run on callback
 */
import {Requestor} from "../structures/Requestor.js";
// import {Utility} from "../structures/Utility.js";
import { GetPageVariable, DeletePageVariable, g_CartArrayKey } from "../structures/PagePersistentVariables.js";
import {VerifyDatabaseTablesExist} from "./PageControl.js";
import { SaveClientMessageAsPageVariable} from "../system_semantics/NotificationControl.js";



// let MainContentHandle = document.getElementById("MainContentHTML");
let g_CurrentCustomerEmail = "";
let g_CartArrayString = "";
let g_CartTotal = 0;

function InitOrderParameters()
{
    let urlParams = new URLSearchParams(document.location.search);
    g_CurrentCustomerEmail = urlParams.get("currentCustomerEmail");
    g_CartTotal = urlParams.get("cartTotal");

    //  go to login page
    if (g_CurrentCustomerEmail == "undefined" || !g_CurrentCustomerEmail)
    {
        // console.log("Email Undefined!");
        let currentUrl = window.location.href;
        let index = currentUrl.indexOf("CheckoutPage.html");
        let newUrl = `${currentUrl.slice(0, index)}LoginPage.html`;
        window.location.href = newUrl;
        SaveClientMessageAsPageVariable({
            'status': "okay",
            'message': "Must login before you can checkout."
        })
    }
}


/**
 *  Loops through the object and uses it construct
 *  a string with no brackets or curly braces.
 */
function PrettifyObjectString(objStr="")
{
    // console.log("OBJ Str: ", objStr);
    let asObj = JSON.parse(objStr);
    let output = "";
    for (let idx=0; idx < asObj.length; idx++)
    {
        let obj = asObj[idx];
        output += `
            <div class="order-item-row">
                <div class="item-details-section">
                    <div class="item-quantity-indicator">${obj['count']}</div>
                    <div class="item-info">
                        <h3 class="item-name">${obj['name']}</h3>
                        <p class="item-meta">
                            <span class="item-unit-price">${obj['price']} each</span>
                        </p>
                    </div>
                </div>
                <div class="item-price-section">
                    <div class="item-total-price">${(Number(obj['count']) * Number(obj['price'])).toFixed(2)}</div>
                    <div class="item-price-label">Subtotal</div>
                </div>
            </div>
        `;
    }
    
    output = output.trim();
    return output;
}

function ParseOrder()
{
    //  Load the CartArray as String from the Local Storage
    if (GetPageVariable(g_CartArrayKey)){
        g_CartArrayString = JSON.stringify(GetPageVariable(g_CartArrayKey));
    }
    return PrettifyObjectString(g_CartArrayString);
}


/**
 *  After parsing the cart array,
 *  display a string summarising the purchase.
 */
function InitPageContent()
{
    let prettyString = new String(ParseOrder());

    let orderSummaryHandle = document.getElementById("OrderSummary");
    orderSummaryHandle.innerHTML += 
    `
        <div class="order-items-list">
            ${prettyString}
        </div>
        <div class="order-total-section">
            <div class="total-row">
                <span class="total-label">Total</span>
                <span class="total-value">${g_CartTotal}</span>
            </div>
            <div class="total-row discount">
                <span class="total-label">Discount</span>
                <span class="total-value">$1.00</span>
            </div>
            <div class="total-row tax">
                <span class="total-label">Tax (VAT)</span>
                <span class="total-value">$2.27</span>
            </div>
            <div class="total-row">
                <span class="total-label">Shipping</span>
                <span class="total-value">$4.99</span>
            </div>
            <div class="total-row grand-total">
                <span class="total-label">Grand Total</span>
                <span class="total-value">${(Number(g_CartTotal) + 4.99 + 2.27 - 1.00).toFixed(2)}</span>
            </div>
        </div>
    `;
}


function ModifyPurchaseButton(success)
{
    if (success)
    {
        //  Empty Cart Variable
        DeletePageVariable(g_CartArrayKey);
        g_CartArrayString = "";
        
        //  Change Page
        let currentUrl = window.location.href;
        let index = currentUrl.indexOf("CheckoutPage.html");
        let newUrl = `${currentUrl.slice(0, index)}MainPage.html`;
        // console.log("New URL: ", newUrl);
        window.location.href = newUrl;
    }
    else{
        let purchaseButton = document.getElementById("CheckoutPagePurchaseButton");
        purchaseButton.children[0] = "Try Again";
    }
        
}

function DisplaySuccess(data)
{
    let msgHandle = document.getElementById("Message");
    // console.log("Data Success: ", data);
    if (data['status'] == true){
        // console.log("Message Good");
        msgHandle.classList.add("success");
        msgHandle.classList.remove("error");
        // Purchase Message
        msgHandle.innerHTML = 
        `
            <div class="message-icon">✓</div>
            <div class="message-content">
                <h3 class="message-title">${data['message']}!</h3>
                <p class="message-text">Your order has been confirmed and will be delivered soon.</p>
            </div>
        `;
        //  Last Modifications!
        ModifyPurchaseButton(true);
    }
    else{
        msgHandle.classList.add("error");
        msgHandle.classList.remove("success");
        //  Error Message
        msgHandle.innerHTML = 
        `
        <div class="message-icon">✕</div>
        <div class="message-content">
            <h3 class="message-title">${data['message']}</h3>
            <p class="message-text">There was an issue processing your payment. Please try again.</p>
        </div>
        `;
        ModifyPurchaseButton(false);
    }
}


/**
 *  Sends the Order to the Server
 *  When order is successfully saved, the Server
 *  responds with success and this triggers the
 *  display Success.
 * 
 */
async function SaveOrderToServer()
{
    // console.log("Save Order To Server Called!");
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/SaveOrder.php";
    // console.log("Save Order Cart Array String: ", g_CartArrayString);
    // console.log("Cart Array Str Length: ", g_CartArrayString.length);
    const data = await rq.SendPost(url, "json", "json", {
        'customer_email':g_CurrentCustomerEmail,
        "order_info": g_CartArrayString,
    });
    DisplaySuccess(data);
}


let CheckoutPageScript = async ()=>
{
    document.querySelector("button#CheckoutPagePurchaseButton.purchase-button").addEventListener('click', async ()=>{
        await SaveOrderToServer();
    });
            
    await VerifyDatabaseTablesExist();
    InitOrderParameters();
    InitPageContent();

}

CheckoutPageScript();