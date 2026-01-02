<?php

    /**
     *  Called when a user tries to checkout.
     *  It ensures the user is logged in. If not logged in, it redirects the user
     *  back to the LoginPage and displays a message.
     */
    include_once "../../_configure/GlobalVariables.php";
    session_start();

    if($_SESSION['id'] != session_id() || empty($_SESSION['name'])){
        // If the session ID is not correct or the name has not been set.
        $_SESSION['UserNotification'] = ['Status'=>"bad",
            'message'=>"You are not logged in yet. Login in to continue."];
        header("Location: " . $g_CSSI . "LoginPage.html");
        // exit;
    }else{
        session_regenerate_id();
        $_SESSION['id'] = session_id();
    }

