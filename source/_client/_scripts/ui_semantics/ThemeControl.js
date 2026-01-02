/**
 * LoadNavbar loads in all the html content for the TopNavbar and BottomNavbars
 * 
 * So this script must run before any script that needs to access any of the
 * html elements loaded into the DOM here. And those scripts must wait for
 * a reasonable period for this script to finish.
 */

import { Requestor } from "../structures/Requestor.js";
// import {Utility} from "../structures/Utility.js";
import { SavePageVariable, GetPageVariable, g_CurrentThemeKey } from "../structures/PagePersistentVariables.js";


function SwitchToDarkTheme(htmlContentAsNode)
{
    document.documentElement.setAttribute('data-theme', 'dark');
    //  Change Icon
    let iconElement = htmlContentAsNode.getElementById("ThemeIcon-Sun").outerHTML;
    let themeButtonHandle = document.getElementById("ThemeButton");
    themeButtonHandle.innerHTML = iconElement;
    SavePageVariable(g_CurrentThemeKey, "dark");
}

function SwitchToLightTheme(htmlContentAsNode)
{
    document.documentElement.setAttribute('data-theme', 'light');
    //  Change Icon
    let iconElement = htmlContentAsNode.getElementById("ThemeIcon-Moon").outerHTML;
    const themeButtonHandle = document.getElementById("ThemeButton");
    themeButtonHandle.innerHTML = iconElement;
    SavePageVariable(g_CurrentThemeKey, "light");
}

//  Callback for Toggle Theme Button Hook
function ToggleThemeCallback(htmlContentAsNode)
{
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');

    let iconElement =  currentTheme == 'dark' ? 
        htmlContentAsNode.getElementById("ThemeIcon-Moon").outerHTML : 
        htmlContentAsNode.getElementById("ThemeIcon-Sun").outerHTML;
    let themeButtonHandle = document.getElementById("ThemeButton");
    themeButtonHandle.innerHTML = iconElement;
    
    SavePageVariable(g_CurrentThemeKey, currentTheme === 'dark' ? 'light' : 'dark');
}

async function InitTheme()
{
    let rq = new Requestor();
    let url = "./ui_elements/IconsTemplates.html";
    const htmlContent = await rq.SendGet(url, "text", {});
    let htmlContentDoc = new DOMParser().parseFromString(htmlContent.trim(), "text/html");
    let iconTemplateContent =  document.importNode(htmlContentDoc.querySelector("template").content, true);

    if (GetPageVariable(g_CurrentThemeKey) == "dark")
    {
        SwitchToDarkTheme(iconTemplateContent);
    }
    else if (GetPageVariable(g_CurrentThemeKey) == "light")
    {
        SwitchToLightTheme(iconTemplateContent);
    }
    else    //  If variable not yet set.
    {    
        SwitchToLightTheme(iconTemplateContent);
    }

    let themeButtonHandle = document.getElementById("ThemeButton");
    themeButtonHandle.addEventListener('click', ()=>{
        ToggleThemeCallback(iconTemplateContent);
    });
}

const ThemeControlScript = async ()=>
{
    await InitTheme();
}

// ThemeControlScript();

export {ThemeControlScript};