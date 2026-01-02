/**
 * LoadNavbar loads in all the html content for the TopNavbar and BottomNavbars
 * 
 * So this script must run before any script that needs to access any of the
 * html elements loaded into the DOM here. And those scripts must wait for
 * a reasonable period for this script to finish.
 */

import {Requestor} from "../structures/Requestor.js";
import { ThemeControlScript } from "./ThemeControl.js";
import { TopNavbarResizeScript } from "./TopNavbarResize.js";
import { ProductSearchModalScript } from "../system_semantics/ProductSearchModal.js";
import { CartBarUIScript } from "./CartBarUI.js";
import { ShoppingCartScript } from "../system_semantics/ShoppingCart.js";
import { UserDetailsScript } from "../system_semantics/UserDetails.js";
// import {Utility} from "../structures/Utility.js";

const Parser = new DOMParser();
let Path = "./ui_elements/";

function LoadTopNavbarContent(htmlContent="")
{
    let targetElementHandle = document.getElementById("TopNavbarHTML");
    let newDoc = Parser.parseFromString(htmlContent, "text/html");
    targetElementHandle.appendChild(newDoc.querySelector("div"));
}

async function FetchTopNavbarContent()
{
    let rq = new Requestor();
    let url = Path + "TopNavbar.html";
    const htmlContent = await rq.SendGet(url, "text", {});
    LoadTopNavbarContent(htmlContent.trim());
}

function LoadSideNavbarContent(htmlContent="")
{
    let targetElementHandle = document.getElementById("SideNavbarHTML");
    let newDoc = Parser.parseFromString(htmlContent, "text/html");
    targetElementHandle.appendChild(newDoc.querySelector("div"));
}

async function FetchSideNavbarContent()
{
    let rq = new Requestor();
    let url = Path + "SideNavbar.html";
    const htmlContent = await rq.SendGet(url, "text", {});
    LoadSideNavbarContent(htmlContent.trim());
}

function LoadBottomNavbarContent(htmlContent="")
{
    let targetElementHandle = document.getElementById("BottomNavbarHTML");
    let newDoc = Parser.parseFromString(htmlContent, "text/html");
    targetElementHandle.appendChild(newDoc.querySelector("div"));
}

async function FetchBottomNavbarContent()
{
    let rq = new Requestor();
    let url = Path + "BottomNavbar.html";
    const htmlContent = await rq.SendGet(url, "text", {});
    LoadBottomNavbarContent(htmlContent);
}

function LoadIconsTemplateContent(htmlContent)
{
    let htmlContentDoc = new DOMParser().parseFromString(htmlContent, "text/html");
    document.body.appendChild(htmlContentDoc.querySelector("template"));
}

// async function FetchIconsTemplateContent()
// {
//     let rq = new Requestor();
//     let url = Path + "IconsTemplates.html";
//     const htmlContent = await rq.SendGet(url, "text", {});
//     LoadIconsTemplateContent(htmlContent.trim());
// }

async function InitPageNavbars()
{
    let existingElements = {
        'TopNavbar': document.getElementById("TopNavbarHTML") != undefined ? true : false,
        'SideNavbar': document.getElementById("SideNavbarHTML") != undefined ? true : false,
        'BottomNavbar': document.getElementById("BottomNavbarHTML") != undefined ? true : false,
    };

    if (existingElements.TopNavbar)
    {
        await FetchTopNavbarContent();
    }
    if (existingElements.SideNavbar)
    {
        await FetchSideNavbarContent();
    }
    if (existingElements.BottomNavbar)
    {
        await FetchBottomNavbarContent();
    }

    //  Load the Icons Templates HTML into DOM
    //  No more needed because of the issue below
    // await FetchIconsTemplateContent();

    //  Call the Scripts Dependent on the TopNavbar Content
    /**
     * Turns out that `ThemeControlScript` and `TopNavbarResizeScript` run before the
     * TopNavbar content loaded by LoadNavbar can be run. It's causing some event registering issues
     * with the ThemeButton and the TopNavbarResizeToggle button.
     * 
     * Solution: Make each of them fetch the icons template content!
     */
    await CartBarUIScript();
    await ShoppingCartScript();
    ProductSearchModalScript();
    //  These three should be called last as they access elements loaded for the TopNavbar
    await ThemeControlScript();
    await TopNavbarResizeScript();
    await UserDetailsScript();
}

const LoadNavbarsScript = async ()=>
{
    await InitPageNavbars();
}


document.addEventListener('DOMContentLoaded', LoadNavbarsScript);