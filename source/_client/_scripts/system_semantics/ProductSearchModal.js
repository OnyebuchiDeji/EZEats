/**
 * Date: 31st December, 2025
 * 
 * Goal:
 *  Create the Modal for each page that includes this Script.
 *  This should include an overlay.
 * 
 *  Implement class switching to activate or deactivate the modal
 *  or overlay when the Search Button is clicked/focused on and something
 *  is typed into it.
 */

import { Requestor } from "../structures/Requestor.js";
import { ProductElementOnClick } from "./CategoryPage.js";

let g_AllProducts = [];



function CreateProductSearchModal()
{    
    // console.log("Create Modal Called!");
    
    let modalOverlay = document.createElement("div");
    modalOverlay.classList.add("search-modal-overlay");
    modalOverlay.id = "SearchModalOverlay";
   
    let modal = document.createElement("div");
    modal.id = "SearchModal";
    modal.classList.add("search-modal");

    modal.innerHTML = `
        <div class="search-modal-header">
            
            <button class="search-modal-close" id="SearchModalCloseButton">×</button>

            <div class="search-input-container">
                <div class="search-input-wrapper">
                    <span class="search-icon">🔍</span>
                    <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Search for products..."
                    id="SearchInput"
                    autofocus
                    >
                    <button class="search-clear-btn" id="SearchClearButtton">✕</button>
                </div>
                
                <!-- Search Stats -->
                <div class="search-stats" id="SearchStats">
                    Showing <strong>0 results</strong> for ""
                </div>
            </div>

            <!-- Optional: Keyboard Shortcut Hint -->
            <div class="search-shortcuts-hint">
                Press <span class="shortcut-key">ESC</span> to close
            </div>
        </div>

    
        <div class='search-modal-content'>
            <div id="SearchResultsList" class="search-empty-state">
                <div class="search-empty-icon">🔍</div>
                <h3 class="search-empty-title">No results found</h3>
                <p class="search-empty-message">
                    Try searching with different keywords or browse our categories
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);
    document.body.appendChild(modal);
}

function openSearchModal()
{
    const modalHandle = document.getElementById("SearchModal");
    const modalHandleOverlay = document.getElementById("SearchModalOverlay");

    modalHandle.classList.add("active");
    modalHandleOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Focus on search input
    setTimeout(() => {
        document.getElementById('SearchInput')?.focus();
    }, 100);
}

function closeSearchModal()
{
    const modalHandle = document.getElementById("SearchModal");
    const modalHandleOverlay = document.getElementById("SearchModalOverlay");

    modalHandle.classList.remove("active");
    modalHandleOverlay.classList.remove("active");
    document.body.style.overflow = "";

    //  When closed, empty the store of products data!
    g_AllProducts = [];
}

// Clear search input
function clearSearch() {
  const input = document.getElementById('SearchInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  SearchInputOnChangeCallback(input);
}

async function LoadProductSearchData()
{
    let rq = new Requestor();
    let url = "../../_server/admin_semantics/output_apis/ServeProducts.php";
    let data = await rq.SendPost(url, "json", "json",
        {'mode':"SAP", 'products_view_max':-1});
    // console.log("All Products: ", g_AllProducts);
    return data;
}

function CreateSearchResultEmpty()
{
    //  Update Search List
    let searchResultList = document.getElementById("SearchResultsList");
    searchResultList.innerHTML = `
        <div class="search-empty-icon">🔍</div>
        <h3 class="search-empty-title">No results found</h3>
        <p class="search-empty-message">
            Try searching with different keywords or browse our categories
        </p>
    `;
    searchResultList.classList.remove("search-results-list");
    if (!searchResultList.classList.contains("search-empty-state"))
    {
        searchResultList.classList.add("search-empty-state");
    }

    //  Update Search Stats
    let searchStats = document.getElementById("SearchStats");
    searchStats.innerHTML = `
        Showing <strong>0 results</strong> for ""
    `;
}

function CreateProductCard(productData)
{
    let productElement = document.createElement("div");
    productElement.classList.add("search-product-card");
    productElement.addEventListener('click', ()=>{ProductElementOnClick(productData['id'], productData['category'], "/", 1)});
    productElement.innerHTML = `
        <div class="search-product-image-wrapper">
          <img src="${productData['image_url']}" alt="${productData['name']}" class="search-product-image">
          <div class="search-product-tags">
            <span class="search-product-tag tag-featured">Featured</span>
          </div>
        </div>

        <div class="search-product-info">
          <span class="search-product-category">${productData['category']}</span>
          <h3 class="search-product-name">${productData['name']}</h3>
          <p class="search-product-description">
            ${productData['description']}
          </p>
        </div>

        <div class="search-product-price-section">
          <div>
            <div class="search-product-price">$${productData['price']}</div>
          </div>
          <div class="search-stock-status in-stock">
            <span class="stock-indicator"></span>
            <span>In Stock</span>
          </div>
          <button class="AddToCart search-add-to-cart"
              data-id='${productData['id']}'
              data-category='${productData['category']}'
              data-subcategory='${productData['subcategory']}'
              data-name='${productData['name']}'
              data-price='${productData['price']}'
              data-imageurl='${productData['image_url']}'>
            <span class="cart-icon">🛒</span>
            Add to Cart
          </button>
        </div>
    `;

    return productElement;
}

function SearchInputOnChangeCallback(targetElement)
{
    let searchKey = targetElement.value;
    if (!searchKey || searchKey.length == 0) {
        CreateSearchResultEmpty();
        return;
    }
    
    const propertiesToCheck = ["name", "category", "subcategory"];
    
    //  List containing products to consider
    let productsToConsider = g_AllProducts.filter((productObject, idx)=>{
        // console.log("Product Object: ", productObject);
        for (const property in productObject)
        {
            if (!propertiesToCheck.includes(property)) {continue;}   //  search by id not allowed
    
            let propertyValue = productObject[property].toLowerCase();
            //  Must check if any property contains the search key
            if (propertyValue.includes(searchKey)){
                return true;
            }
        }
        return false;
    });

    if (productsToConsider.length == 0)
    {
        CreateSearchResultEmpty();   
        return;
    }

    //  If products to consider exist
    //  Update Search List
    let searchResultList = document.getElementById("SearchResultsList");
    searchResultList.innerHTML = "";

    //  Create a Product Card Element for Each to Consider
    productsToConsider.forEach((productObject, idx)=>{
        searchResultList.appendChild(CreateProductCard(productObject));
    });

    searchResultList.classList.remove("search-empty-state");
    if (!searchResultList.classList.contains("search-results-list"))
    {
        searchResultList.classList.add("search-results-list");
    }

    //  Update Search Stats
    let searchStats = document.getElementById("SearchStats");
    searchStats.innerHTML = `
        Showing <strong>${productsToConsider.length} results</strong> for "${searchKey}"
    `;
}

/**
 * These are the callbacks concerning the actual searching for products
 */
function RegisterSearchCallbacks()
{
    //  Search Clear
    const searchClearButton = document.getElementById("SearchClearButtton");
    searchClearButton.addEventListener('click', clearSearch);

    //  Search On Input
    const searchInput = document.getElementById("SearchInput");
    searchInput.addEventListener('input', (e)=>{SearchInputOnChangeCallback(e.target);});
}

/**
 * These are the callbacks concerning the controllign of the visibility
 * of the search modal
 */
function RegisterSearchModalToggleCallbacks()
{
    //  Register Search Button Open and Close
    const searchButton = document.getElementById("SearchInputButton");
    // console.log("In Visibility Callback!");
    searchButton.addEventListener('click', async (e)=>{
        let modalHandle = document.getElementById("SearchModal");
        // console.log("Search Button Clicked!");
        if (!modalHandle.classList.contains("active"))
        {
            openSearchModal();
            if (g_AllProducts.length <= 0) {
                g_AllProducts = await LoadProductSearchData();
            }
        }
        else
        {
            closeSearchModal();
        }
    });

    //  Within Modal Close Button
    const searchModalCloseButton = document.getElementById("SearchModalCloseButton");
    searchModalCloseButton.addEventListener('click', closeSearchModal);

    //  Close Modal Events
    const modalHandleOverlay = document.getElementById("SearchModalOverlay");
    modalHandleOverlay.addEventListener('click', closeSearchModal);

    //  Close Modal with Escape Key
    document.addEventListener('keydown', (e) => {
        // Open search with Ctrl+K or Cmd+K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        
        // Close search with Escape
        if (e.key === 'Escape') {
            closeSearchModal();
        }
    });
}


const ProductSearchModalScript = ()=>
{
    CreateProductSearchModal();
    RegisterSearchModalToggleCallbacks();
    RegisterSearchCallbacks();
};


export {ProductSearchModalScript};