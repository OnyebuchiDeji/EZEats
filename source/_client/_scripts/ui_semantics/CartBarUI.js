/**
 *  Simply Controls the Cart Bar Widget that Opens or Closes
 *  It also adds this Cart Bar to the current DOM
 */
import {Requestor} from "../structures/Requestor.js";
// import {Utility} from "../structures/Utility.js";
import { SavePageVariable, g_CartBarStateKey } from "../structures/PagePersistentVariables.js";

/**
 *  Called when the CartBar's Close Button is pressed.
 *  It simply changes a class that transform's the position
 *  of the CartBar
 */
function ToggleCartBar()
{
    // console.log("cart bar toggled!");
    let cartBarHandle = document.getElementById("CartBarHTML");
    let cartOverlay = document.querySelector(".cart-overlay");
    // console.log("Cart Bar: ", CartBarHandle);
    let state = "open";
    if (cartBarHandle.classList.contains("open")){
        cartBarHandle.classList.replace("open", "close");
        state = "close";
        cartOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    else{
        cartBarHandle.classList.replace("close", "open");
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    SavePageVariable(g_CartBarStateKey, state);
}

function RegisterCartIconOpenCartbarCallback()
{
    //  Register Cart Icon Open Cart Bar Handle
    const cartIconElement = document.getElementById("CartIconElement");
    cartIconElement.addEventListener('click', ToggleCartBar);
}

function RegisterCloseCartBarCallback()
{
   const cartBarCloseButton = document.getElementById("CartBarClose");
    cartBarCloseButton.addEventListener('click', ToggleCartBar);
    
    const cartBarCloseButton2 = document.getElementById("CartBarClose2");
    cartBarCloseButton2.addEventListener('click', ToggleCartBar);

    // Close cart with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById("CartBarHTML").classList.contains('open')) {
            ToggleCartBar();
        }
    });
}


//  Loads the requested HTML to the DOM
function LoadCartBar(htmlContentDoc)
{   
    // <!-- Shopping Cart Overlay (appears when cart is open) -->
    document.body.innerHTML += `<div class="cart-overlay"></div>`;
    document.body.appendChild(htmlContentDoc.querySelector("div#CartBarHTML.shopping-cart-sidebar.CartBarElement"));
    let cartBarHTML = document.getElementById("CartBarHTML");
    cartBarHTML.classList.add("close");
    RegisterCartIconOpenCartbarCallback();
    RegisterCloseCartBarCallback();
}


//  Obtains teh CartBar html as string
async function RequestCartBarHTML()
{
    let rq = new Requestor();
    let url = "./ui_elements/CartBar.html";
    const htmlContent = await rq.SendGet(url, "text", {});
    let htmlContentDoc = new DOMParser().parseFromString(htmlContent.trim(), "text/html");

    LoadCartBar(htmlContentDoc);
}

const CartBarUIScript = async ()=>
{
    await RequestCartBarHTML();
}


// CartBarUI();

export {CartBarUIScript};