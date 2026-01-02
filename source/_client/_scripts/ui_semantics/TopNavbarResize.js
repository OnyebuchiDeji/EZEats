//  Date: 29-12-2025

/**
 * LoadNavbar loads in all the html content for the TopNavbar and BottomNavbars
 * 
 * So this script must run before any script that needs to access any of the
 * html elements loaded into the DOM here. And those scripts must wait for
 * a reasonable period for this script to finish.
 */


import { Requestor } from "../structures/Requestor.js";


function LoadTopbarResizeButtonIcon(htmlContentAsNode, isOpen)
{
    let iconElement = isOpen ? htmlContentAsNode.getElementById("TopNavbarIcon-Close").outerHTML :
        htmlContentAsNode.getElementById("TopNavbarIcon-Open").outerHTML;
    document.getElementById("TopNavbarToggleButton").innerHTML = iconElement;
}

// function ToggleSearchVisibility()
// {
//     const searchInputElementHandle = document.getElementById("SearchInput");
//     if (searchInputElementHandle.classList.contains("ShowSearch")){
//         searchInputElementHandle.classList.toggle("ShowSearch");
//     }
// }

function ToggleTopNavbarLinkItemsResize(htmlContentAsNode)
{
    const topNavbarLinkItemsHandle = document.getElementById("TopNavbarItems");
    if (topNavbarLinkItemsHandle.classList.contains("Resized")){
        topNavbarLinkItemsHandle.classList.toggle("Resized");
        LoadTopbarResizeButtonIcon(htmlContentAsNode, false);
    }
}

function RegisterTopNavbarBodyResizeEvent(htmlContentAsNode)
{
    window.addEventListener("resize", ()=>{
        let windowWidth = document.body.offsetWidth;
        
        if (windowWidth > 768)
        {
            ToggleTopNavbarLinkItemsResize(htmlContentAsNode);
            // ToggleSearchVisibility();
        }
    });
}

// function RegisterSearchResizeEvent(htmlContentAsNode)
// {
//     const searchButtonHandle = document.getElementById("SearchInputButton");
    
//     searchButtonHandle.addEventListener("click", ()=>{
//         const searchInputElementHandle = document.getElementById("SearchInput");
//         searchInputElementHandle.classList.toggle("ShowSearch");
//         ToggleTopNavbarLinkItemsResize(htmlContentAsNode);
//     });
// }

function RegisterButtonHandleEvent(htmlContentAsNode)
{
    const buttonHandle = document.getElementById("TopNavbarToggleButton");
    
    buttonHandle.addEventListener("click",()=>{
        document.getElementById("TopNavbarItems").classList.toggle("Resized");
        // ToggleSearchVisibility();
        buttonHandle.classList.toggle("Open");
        LoadTopbarResizeButtonIcon(htmlContentAsNode, buttonHandle.classList.contains("Open")); 
    });
}

async function InitTopNavbar()
{
    let rq = new Requestor();
    let url = "./ui_elements/IconsTemplates.html";
    const htmlContent = await rq.SendGet(url, "text", {});
    let htmlContentDoc = new DOMParser().parseFromString(htmlContent.trim(), "text/html");
    let iconTemplateContent =  document.importNode(htmlContentDoc.querySelector("template").content, true);

    RegisterTopNavbarBodyResizeEvent(iconTemplateContent);
    RegisterButtonHandleEvent(iconTemplateContent);
}

const TopNavbarResizeScript = async ()=>
{
    await InitTopNavbar();
}

export {TopNavbarResizeScript};