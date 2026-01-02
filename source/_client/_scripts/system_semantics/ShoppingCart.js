/**
 *  Most Up-to-date version
 */

import {Requestor} from "../structures/Requestor.js";
import { SavePageVariable, GetPageVariable, DeletePageVariable, g_CartArrayKey} from "../structures/PagePersistentVariables.js";
// import {Utility} from "../structures/Utility.js";



// //  Global Variables
// let Util = new Utility();

// let g_CartArray = [];
// let g_CartTotal = 0;
let g_CurrentCustomerEmail = "";


function UpdateCartState(cartArrayRef)
{
    let cartQuantity = 0;
    let cartTotal =  0;
    let cartArray = Array.from(cartArrayRef);
    cartArray.forEach((product)=>{
        cartTotal += Number(product['count']) * Number(product['price']);
        cartQuantity += Number(product['count']);
    });

    let cartIconHandle = document.getElementById("CartIconElement");
    cartIconHandle.children[1].innerText = cartQuantity;

    //  Return if in CheckoutPage.html
    //  as this page doesn't have access to the CartBar 
    if (window.location.href.includes("CheckoutPage.html")) {return;}

    let cartCheckoutButton = document.getElementById("CartBarCheckout");
    if (cartTotal <= 0)
    {
        cartCheckoutButton.disabled = true;
    }
    else{
        cartCheckoutButton.disabled = false;
    }
    let cartBarTotalDisplayHandle = document.getElementById("CartBarTotalDisplay");
    cartBarTotalDisplayHandle.innerText = `$${cartTotal}`;

    //  If Cart is Empty
    if (cartQuantity == 0)
    {
        const cartBarProductsListHandle = document.getElementById("CartBarProductsList");
        cartBarProductsListHandle.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p class="cart-empty-text">Your cart is empty</p>
            </div>
        `;
    }
}

/**
 *  This is called by `AddToCart` to add to the CartBar element/widget
 *  a new Product added.
 */
function CreateCartProduct(orderProductInfo, cartArrayRef)
{
    // console.log("Create Cart Product Called!");
    let cartArray = Array.from(cartArrayRef);
    let existingItem = cartArray.find((product, indx)=>{
        if (product.id == orderProductInfo['id']){
            return true;
        }
    });
    //  if item does not already exist in cart
    if (existingItem == undefined)
    {
        //  Add to Cart Variable
        cartArray.push(orderProductInfo);
    }
    // console.log("Cart After New Item Added: ", cartArray);

    UpdateCartState(cartArray);
    SavePageVariable(g_CartArrayKey, cartArray);

    if (window.location.href.includes("CheckoutPage.html")) {return;}

    //  Add to Cart Bar Element's Products List
    let newCartProduct = document.createElement("div");
    newCartProduct.classList.add("CartBarOrderProduct");
    newCartProduct.classList.add("cart-item");
    newCartProduct.dataset.id = orderProductInfo['id'];

    newCartProduct.innerHTML = 
        `
        <img src=${orderProductInfo['image_url']} class="cart-item-image" alt='${orderProductInfo['name']}'>
        `;
    let itemDetails = document.createElement("div");
    itemDetails.classList.add("cart-item-details");

    let itemName = document.createElement("h3");
    itemName.classList.add("cart-item-name");
    itemName.innerText = orderProductInfo['name'];

    let itemPrice = document.createElement("p");
    itemPrice.classList.add("cart-item-price");
    itemPrice.innerText = orderProductInfo['price'];

    itemDetails.appendChild(itemName);
    itemDetails.appendChild(itemPrice);

    let productQuantityElement = document.createElement("div");
    productQuantityElement.classList.add("ProductQuantity");
    productQuantityElement.classList.add("cart-item-quantity");

    let deductButton = document.createElement("button");
    deductButton.classList.add("quantity-btn");
    deductButton.ariaLabel = "Decrease quantity";
    deductButton.innerHTML = `<span>-</span>`;
    deductButton.addEventListener('click', ()=>{
        // console.log("Add Button Called");
        
        //  find product current index
        let CartArray = GetPageVariable(g_CartArrayKey);
        let targetIndex = -1;
        for (let idx = 0; idx < cartArray.length; ++idx)
        {
            let currentProduct = cartArray[idx];
            if (currentProduct['id'] == orderProductInfo['id'])
            {
                targetIndex = idx;
                break;
            }
        }
        ModifyCartProductCount(newCartProduct, targetIndex, -1, CartArray);
    });

    let addButton = document.createElement("button");
    addButton.classList.add("quantity-btn");
    addButton.ariaLabel = "Increase quantity";
    addButton.innerHTML = `<span>+</span>`;
    addButton.addEventListener('click', ()=>{
        // console.log("Add Button Called");
        //  find product current index
        let CartArray = GetPageVariable(g_CartArrayKey);
        let targetIndex = -1;
        for (let idx = 0; idx < cartArray.length; ++idx)
        {
            let currentProduct = cartArray[idx];
            if (currentProduct['id'] == orderProductInfo['id'])
            {
                targetIndex = idx;
                break;
            }
        }
        ModifyCartProductCount(newCartProduct, targetIndex, 1, CartArray);
    });


    let quantityElement = document.createElement("span");
    quantityElement.classList.add("quantity-display");
    quantityElement.innerText = orderProductInfo['count'];
    
    productQuantityElement.appendChild(deductButton);
    productQuantityElement.appendChild(quantityElement);
    productQuantityElement.appendChild(addButton);

    itemDetails.appendChild(productQuantityElement);
    newCartProduct.appendChild(itemDetails);

    let cartBarProductsListHandle = document.getElementById("CartBarProductsList");
    cartBarProductsListHandle.appendChild(newCartProduct);
}

/**
 *  This is called by `AddToCart` to modify an existing Product
 *  element.
 *  Specifically, it modifies the ProductCount
 *  Likewise it modifies that product's count in the CartArray
 *  If the newProductCount is 0, it removes that element through
 *  the reference.
 *  
 */
function ModifyCartProductCount(orderElementRef, indexInCartArray, countIncrement=0, cartArrayRef)
{
    // console.log("Modify Cart Product Count Called!");
    let cartArray = Array.from(cartArrayRef);
    // let orderElementChildren = orderElementRef.children;
    let cartOrderProductQuantityDisplays = document.getElementsByClassName("quantity-display");

    // console.log("Quantity Displays: ", cartOrderProductQuantityDisplays);
    
    for (let i=0; i<cartOrderProductQuantityDisplays.length;++i)
    {
        if (i != indexInCartArray) continue;
        let currentQuantityDisplay = cartOrderProductQuantityDisplays[i];
        let prevQuantity = Number(currentQuantityDisplay.innerText);
        let resultCount = prevQuantity + countIncrement;
        if (resultCount > 0){
            // console.log("Result Count > 0!");
            currentQuantityDisplay.innerText = String(resultCount);
            cartArray[indexInCartArray]['count'] = resultCount;
        }
        else{
            //  Remove that Product form CartArray
            // console.log("Remove Product Called!");
            cartArray = cartArray.length > 1 ? cartArray.slice(0, indexInCartArray).concat(cartArray.slice(indexInCartArray + 1, cartArray.length)) :
                [];
            let cartBarProductsListHandle = document.getElementById("CartBarProductsList");
            cartBarProductsListHandle.removeChild(orderElementRef);
        }
        break;
    }
    // console.log("OrderElement: ", orderElementRef);
    // console.log("Modified Cart: ", cartArray);

    UpdateCartState(cartArray);
    SavePageVariable(g_CartArrayKey, cartArray);
}

/*
 *  Will Check if an Element of that ID already exists.
 *  If it does, it will modify the Product Count.
 *  If it doesn't, it will add the product
*/
function AddToCart(itemInfo)
{
    // console.log("Add To Cart Clicked!");
    let cartArray = GetPageVariable(g_CartArrayKey);

    let index = -1;
    let existingItem = cartArray.find((product, indx)=>{
        if (product.id == itemInfo['id']){
            index = indx;   //  Save the index
            return true;
        }
    });

    // console.log("Chosen Index: ", index);
    // console.log("Existing Item: ", existingItem);

    
    let cartBarProductsListHandle = document.getElementById("CartBarProductsList");
    // console.log("Cart Bar Products List Children: ", cartBarProductsListHandle.children);
    // console.log(existingItem == undefined);

    //  If Item already exists, modify the CartBar ProductsList

    //  Cannot do `if (existingItem)` else it will always be false  
    //  Must do below. Logic: if existing item is valid, just modify it.
    //  hence if existingItem != undefined
    if (existingItem != undefined)
    {
        // console.log("Item Exists!");
        //  Modify the CartBarListElement's Display
        for (let i=0; i<cartBarProductsListHandle.children.length; ++i){
            let child = cartBarProductsListHandle.children[i];
            if (child.dataset.id == itemInfo['id']){
                ModifyCartProductCount(child, index, 1, cartArray);
                break;
            }
        }
    }
    else{
        // console.log("New Item!");
        let newOrderItem = {
            'id': itemInfo['id'],
            'category':itemInfo['category'],
            'subcategory': itemInfo['subcategory'],
            'name': itemInfo['name'],
            'price': itemInfo['price'],
            'count': 1,
            'image_url': itemInfo['image_url']
        };
        CreateCartProduct(newOrderItem, cartArray);
    }
}

/**
 *  This simply redirects to the CheckoutPage
 *  after attaching the currentUserEmail to the url parameters
 */
function CartCheckout()
{
    let cartTotal = 0;
    let cartArray = GetPageVariable(g_CartArrayKey);
    cartArray.forEach((product)=>{
        cartTotal += Number(product['price']) * Number(product['count']);
    });

    let currentUrl = window.location.href;
    let index = currentUrl.includes("CategoryPage.html") ? currentUrl.indexOf("CategoryPage.html") :
        currentUrl.includes("ProductPage.html") ? currentUrl.indexOf("ProductPage.html") : "";
    let newUrl = `${currentUrl.slice(0, index)}CheckoutPage.html?` + 
            new URLSearchParams({
            'currentCustomerEmail' : g_CurrentCustomerEmail,
            'cartTotal' : cartTotal
        });
    window.location.href = newUrl;
}

function RegisterCheckoutButtonCallback()
{
    if (window.location.href.includes("CheckoutPage.html")) {return;}

    document.getElementById("CartBarCheckout").onclick = ()=>{
        CartCheckout();
    };
}


/**
 *  Registers the `AddToCart` callback
 *  to every button element of class `AddToCart`.
 */
function RegisterAddToCartCallback()
{
    let addToCartElements = document.getElementsByClassName("AddToCart");
    for (let i=0; i<addToCartElements.length; ++i){
        let currentElement = addToCartElements[i];
        currentElement.onclick = ()=>{
            AddToCart(
                {
                    'id':currentElement.dataset.id,
                    'category':currentElement.dataset.category,
                    'subcategory':currentElement.dataset.subcategory,
                    'name':currentElement.dataset.name,
                    'price':currentElement.dataset.price,
                    'image_url': currentElement.dataset.imageurl
                }
            );
        };
    }
}

/**
*  Populate the Cart Bar Products List Element
*  using the information from the requested Cart data
*/
function PopulateCartBarProductsListElement(cartArrayRef)
{
    let cartArray = Array.from(cartArrayRef);
    // console.log("Cart Array: ", cartArray);
    // console.log("Cart Array Length: ", cartArray.length);
    for (let i=0; i<cartArray.length; i++)
    {
        let orderInfo = cartArray[i];
        // console.log("Order Info: ", orderInfo);
        CreateCartProduct(orderInfo, cartArray);
            
    }
    UpdateCartState(cartArray);
}


/**
 *  This will get the cart information saved as a cookie
 *  on the server side.
 */

function InitCartArray()
{
    // console.log("In InitCartArray");
    if (GetPageVariable(g_CartArrayKey) != null)
    {
        let cartArray = [];
        cartArray = GetPageVariable(g_CartArrayKey);
        PopulateCartBarProductsListElement(cartArray);
    }
    else{
        SavePageVariable(g_CartArrayKey, []);
    }
}

async function RequestUserEmail()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeCurrentCustomerEmail.php";
    const data = await rq.SendPost(url, "json", "json", {});
    if (data['status'] == true)
    {
        g_CurrentCustomerEmail = data['email'];
        // console.log("Email Received: ", g_CurrentCustomerEmail);
    }

    InitCartArray();
    //  because MainPage doesn't have the Items Display and hence no 'Add To Cart' button!
    if (!window.location.href.includes("MainPage.html"))
    {
        RegisterAddToCartCallback();
    }
    RegisterCheckoutButtonCallback();

    // DeletePageVariable(g_CartArrayKey)
}


const ShoppingCartScript = async ()=>
{
    await RequestUserEmail();
}

// ShoppingCartScript();


export {ShoppingCartScript};