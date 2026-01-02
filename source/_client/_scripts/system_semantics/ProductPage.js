import {Requestor} from "../structures/Requestor.js";
import {Utility} from "../structures/Utility.js";
import {VerifyDatabaseTablesExist} from "./PageControl.js";
import { ProductElementOnClick } from "./CategoryPage.js";
/**
 *  Parameter is an array of objects
 *  
 */
// let g_MainContentHandle = document.getElementById("MainContentHTML");
// let Util = new Utility();

let g_CurrentCategory = "";
let g_CurrentProductId = "";

// let ProductInformation = new Object();

/**
 * -----------------------------------------------------
 *              Product Information
 * -----------------------------------------------------
 */

function InitCurrentProduct()
{
    let parsedParameters = new URLSearchParams(document.location.search);
    g_CurrentProductId = parsedParameters.get("productId");
    g_CurrentCategory = parsedParameters.get("category");
}

function LoadProductInformation(data=Object)
{
    //  Keeps a copy
    //  Three Methods:
    /**
     * ProductInformation = {...data};
     * 
     * ProductInformation = Object.assign({}, ProductInformation);
     *  .assign(target_obj, src_obj)
     * ProductInformation = JSON.parse(JSON.stringify(ProductInformation));
     * 
     */
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
        </div>` + mainContentHandle.innerHTML;

    let productInformationContainer = document.getElementById("ProductInformation");
    productInformationContainer.classList.add("product-card");

    let productImageWrapper = document.createElement("div");
    productImageWrapper.classList.add("product-image-wrapper");
    
    productImageWrapper.innerHTML = `
        <img src=${data['image_url']} alt="Product" class="product-image">
        <div class="product-tags">
            <span class="product-tag tag-new">New</span>
        </div>
        <button class="wishlist-btn">♡</button>
    `;

    productInformationContainer.innerHTML = `
        <div class='product-info ProductInformationContainer'>
            <span class="product-category-label">${data['category']}</span>
            <span class="product-subcategory-label">${data['subcategory']}</span>
            <h3 class="product-title">${data['name']}</h3>
            <p class="product-description">${data['description']}</p>
            <!---<div class="product-rating">
                <span class="rating-stars">★★★★☆</span>
                <span class="rating-count">(24)</span>
            </div>--->
            <div class="product-price-section">
                <span class="product-price">${data['price']}</span>
            </div>
            <button class='AddToCart add-to-cart-button'
                data-id='${data['id']}'
                data-category='${data['category']}'
                data-subcategory='${data['subcategory']}'
                data-name='${data['name']}'
                data-price='${data['price']}'
                data-imageurl='${data['image_url']}'>
                <span class="cart-icon">🛒</span> Add to Cart
            </button>   
        </div>
    `;
    
    productInformationContainer.prepend(productImageWrapper);
}


async function FetchProductContent()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeProducts.php";
    const data = await rq.SendPost(url, "json", "json", {'mode':"SSP", 'product_id':g_CurrentProductId});
    LoadProductInformation(data);
}

/**
 * -------------------------------------------------------
 *                  Similar Products
 * -------------------------------------------------------
 */

function LoadSimilarProducts(data)
{
    let similarProductsHandle = document.getElementById("SimilarProducts");
    similarProductsHandle.classList.add("product-list");

    let countLimit = 6;
    //  Loop through Array that doesn't have the current product
    data.filter((product, index)=>{
        if (product.id != g_CurrentProductId && index <= countLimit)
        {
            return true;
        }
        return false;
    }).filter((product)=>{
        if (product['subcategory']){
            //  If it has a subcategory, sure
            return true;
        }
        return true;    //  If it doesn't, okay
    }).forEach((product, index)=>{
        let productContainer = document.createElement("div");
        productContainer.classList.add("ProductContainer");
        productContainer.classList.add("product-card");
        
        // let subcategoryElement = document.createElement("div");
        // subcategoryElement.classList.add("ProductSubcategoryBanner");
        // subcategoryElement.classList.add("category-item");

        let imageWrapperElement = document.createElement("div");
        imageWrapperElement.classList.add("product-image-wrapper");
        imageWrapperElement.onclick = ()=>{
            ProductElementOnClick(product['id'], product['category'], "?");
        };

        imageWrapperElement.innerHTML = `
            <img src=${product['image_url']} alt="Product" class="product-image">
            <div class="product-tags">
                <span class="product-tag tag-new">New</span>
            </div>
            <button class="wishlist-btn">♡</button>
        `;

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
        similarProductsHandle.appendChild(productContainer);
    });
}

//  -----------------------------------------------------

async function FetchSimilarProductsContent()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeProducts.php";
    const data = await rq.SendPost(url, "json", "json", {'mode':"SAPC", 'category':g_CurrentCategory});
    LoadSimilarProducts(data);
}

/**
 * -------------------------------------------------------
 *                  Other Category
 * -------------------------------------------------------
 */
function CategoryElementOnClick(categoryName){
    let currentUrl = window.location.href;
    let index = currentUrl.indexOf("ProductPage.html");
    let newUrl = currentUrl.slice(0, index);
    newUrl += "CategoryPage.html?" +
        new URLSearchParams({'categoryName' : categoryName});
    // console.log("New URL: ", newUrl);
    window.location.href = newUrl;
}

function LoadOtherCategoryContent(data)
{
    // let dataArr = JSON.parse(JSON.stringify(data));  //  no need to copy
    let dataCategoryArray = data['category_array'];
    let dataFrequencyArray = data['frequency_array'];
    let otherCategoriesHandle = document.getElementById("OtherCategories");
    otherCategoriesHandle.classList.add("category-list");

    let countLimit = 6;
    
    let util = new Utility();
    //  Load List of Categories Except the Current One
    dataCategoryArray.filter((categoryName, index)=>{
            if (categoryName!=g_CurrentCategory && index <= countLimit){
                return true;
            }
            return false;
        })
        .forEach((name, index)=>{
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
            
            otherCategoriesHandle.appendChild(categoryElement);
        });
}

async function FetchOtherCategoriesContent()
{
    let rq = new Requestor();
    let url = "../../_server/system_semantics/apis/ServeCategories.php";
    const data = await rq.SendPost(url, "json", "json", {});
    LoadOtherCategoryContent(data);
}

//  ---------------------------------------------------

const ProductPageScript = async () =>
{
    await VerifyDatabaseTablesExist();
    InitCurrentProduct();
    await FetchProductContent();
    await FetchSimilarProductsContent();
    await FetchOtherCategoriesContent();
}

ProductPageScript();