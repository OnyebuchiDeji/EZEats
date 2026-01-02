import {Requestor} from "../structures/Requestor.js";
import {Utility} from "../structures/Utility.js";
import {VerifyDatabaseTablesExist} from "./PageControl.js";
/**
 *  Parameter is an array of productects
 */


function GetCurrentCategory()
{
    let parsedParameters = new URLSearchParams(document.location.search); 
    return parsedParameters.get("categoryName");
}

/**
 * By using .lastIndexOf, I ensure to get the index of the last occurrence
 * of the substring.
 * By adding `indexOffset`, I get more control where the slice should start.
 * This is especially important when dealing with an ambigous page. I want to switch
 * to the `ProductPage` from this ambigous page, and hence need the last index of the
 * substring "/", but require the indexOffset so as to not slice up to the '/' but
 * past it. This is demonstrated in the `ProductSearchModal.js`
 */
function ProductElementOnClick(productId, productCategory, currentPageSliceIdentifier, indexOffset=0){
    //  This will be the MainPage
    let currentUrl = window.location.href;
    let index = currentUrl.lastIndexOf(currentPageSliceIdentifier);
    let newUrl = currentUrl.slice(0, index + indexOffset);
    newUrl += "ProductPage.html?" + 
        new URLSearchParams({'productId' : productId, 
            'category' : productCategory});
    // console.log("New URL: ", newUrl);
    window.location.href = newUrl;
}


function LoadProductsContent(data=Array)
{
    //  This doesn't copy the array data properly.
    /**
     * Can do
     *  1.  let dataArr = data.map((x)=>x); // though will only deep copy
     *          an array of primitive objects or literal arrays or objects (Complex), not prototypes like Object() or Array()
     *      literal array and object:
     *          [0, 1, 2] and {x: "1", y:"20"}
     * 
     *  2.  Spread Operator:
     *      let newArr = [...oldArr];
     *      It's still not a full deep copy. Only works for primitive or literal complex
     * 
     *  3.  Slice Operator:
     *      let newArr = oldArr.slice(start, end);
     *      Also not full deep copy.
     * 
     *  4.  JSON .parse and .stringify
     *      let newArr = JSON.parse(JSON.stringify(oldArr))
     *      It is a full deep copy.
     *      It converts the object or array into a string and then
     *      converts back to a new deep copy of the object.
     *  
     */
    // let dataArr = JSON.parse(JSON.stringify(data));  //  no need to copy

    // let addedSubcategories = [];
    let util = new Utility();
    let mainContentHandle = document.getElementById("MainContentHTML");
    mainContentHandle.innerHTML = `
        <!-- View Toggle -->
        <div class="view-toggle-container">
            <span class="view-toggle-label">View:</span>
            <div class="view-toggle-buttons">
                <button id="view-grid-btn" class="view-toggle-btn active">
                <span class="view-toggle-icon">⊞</span> Grid
                </button>
                <button id="view-list-btn" class="view-toggle-btn">
                <span class="view-toggle-icon">☰</span> List
                </button>
            </div>
        </div>`;
        
        
    let productListContainer = document.createElement("div");
    productListContainer.classList.add("product-list");

    // let dataArr = new Array(data);
    data.forEach((product, index)=>{
        let productContainer = document.createElement("div");
        productContainer.classList.add("ProductContainer");
        productContainer.classList.add("product-card");
        
        // let subcategoryElement = document.createElement("div");
        // subcategoryElement.classList.add("ProductSubcategoryBanner");
        // subcategoryElement.classList.add("category-item");

        let imageWrapperElement = document.createElement("div");
        imageWrapperElement.classList.add("product-image-wrapper");
        imageWrapperElement.addEventListener('click', ()=>{
            ProductElementOnClick(product['id'], product['category'], "CategoryPage.html");
        });

        imageWrapperElement.innerHTML = `
            <img src=${product['image_url']} alt="Product" class="product-image">
            <div class="product-tags">
                <span class="product-tag tag-new">New</span>
            </div>
            <button class="wishlist-btn">♡</button>
        `;
        
        // if (product['subcategory'] && addedSubcategories.includes(product['subcategory']) == false){
        //     addedSubcategories.push(product['subcategory']);
        //     let subcategoryHeader = document.createElement("h3");
        //     subcategoryHeader.classList.add("category-name");
        //     subcategoryHeader.innerText = util.Capitalize(product['subcategory']);
        //     subcategoryElement.appendChild(subcategoryHeader);

        //     productListContainer.appendChild(subcategoryElement);
        // }

        //  create the Product Container HTML   
        productContainer.innerHTML = 
        `
            <div class='product-info ProductInformationContainer'>
                <span class="product-category-label">${product['category']}</span>
                <span class="product-subcategory-label">${product['subcategory']}</span>
                <h3 class="product-title">${product['name']}</h3>
                <div class="product-price-section">
                    <span class="product-price">${product['price']}</span>
                </div>
                <button class='AddToCart add-to-cart-button'
                    data-id='${product['id']}'
                    data-category='${product['category']}'
                    data-subcategory='${product['subcategory']}'
                    data-name='${product['name']}'
                    data-price='${product['price']}'
                    data-imageurl='${product['image_url']}'>
                    <span class="cart-icon">🛒</span> Add to Cart
                </button>   
            </div>
        `;
        productContainer.prepend(imageWrapperElement);
        productListContainer.appendChild(productContainer);
    });
    mainContentHandle.appendChild(productListContainer);
}

async function FetchProductsContent()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeProducts.php";
    const data = await rq.SendPost(url, "json", "json",
        {'mode':"SAPC", 'category':GetCurrentCategory()});
    LoadProductsContent(data);
}

const CategoryPageScript = async () =>
{
    let mainContentHandle = document.getElementById("MainContentHTML");
    mainContentHandle.style.display = "grid";
    mainContentHandle.style.gridTemplateColumns = "1fr";

    await VerifyDatabaseTablesExist();
    await FetchProductsContent();
}

if (window.location.href.includes("CategoryPage.html"))
{
    CategoryPageScript();
}

//  When the below function is imported, `CategoryPageScript` will run
export {ProductElementOnClick};