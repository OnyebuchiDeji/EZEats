/**
 *  This initializes all the global persistenet variables
 *  and defines the functions used to modify them. 
 *  
*/

// const g_CurrentLayoutID = "currentLayoutID";
// const g_CurrentPageID = "currentPageID";
// const g_CurrentSideNavbarID = "sideNavbarID";
const g_CartArrayKey = "CartArrayObjectKey"; //  no longer saving cart data on client side!
const g_CartBarStateKey = "CartBarStateKey";
const g_UserInfoKey = "UserInfoKey";
const g_ClientSideNotificationKey = "ClientNotification";
const g_AdminDisplayOutputContent = "AdminDisplayOutputContent";
const g_CurrentThemeKey = "CurrentTheme";

const SavePageVariable = (id, data) =>
{
    localStorage.setItem(id, JSON.stringify(data));
}

const GetPageVariable = (id) =>
{
    return JSON.parse(localStorage.getItem(id));
}

const DeletePageVariable = (id) =>
{
    localStorage.removeItem(id);
}

//  A module can only have 1 export default.
//  Also, an export default is for an import default.
//  It specifies the object to return from imports by default.
// export default SavePageVariable;
// export default GetPageVariable;

//  But can be done this way:
export {SavePageVariable, GetPageVariable,
    DeletePageVariable, g_CartArrayKey,
    g_UserInfoKey, g_CartBarStateKey,
    g_ClientSideNotificationKey, g_AdminDisplayOutputContent,
    g_CurrentThemeKey
};