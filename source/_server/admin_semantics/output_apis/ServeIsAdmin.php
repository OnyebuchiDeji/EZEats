<?php
    /**
     *  This is requested by the AdminAuthorise JS script.
     *  It serves the isAdmin session variable to the client side.
     * 
     *  With this, the client side will display after login, a link in the header
     *  bar that allows the user enter the Admin Command Line Page. 
     */

    include_once "../../_configure/VerifyRequestMethodGet.php";
    include_once "../../_configure/SessionStart.php";
    
    if (isset($_SESSION['is_admin']))
    {
        echo json_encode(['is_admin'=>$_SESSION['is_admin']]);
    }
    else
    {
        echo json_encode(['is_admin'=>false]);
    }