<?php
    /**
     *  API that keeps track of the current user notification or message
     *  and serves it to any JS that requests it. This notification session variable
     *  is updated based on user actions.
    */

    
    include_once "../../_configure/VerifyRequestMethodGet.php";
    include_once "../../_configure/SessionStart.php";

    //  First Checks if the UserNotification Exists.
    if (isset($_SESSION['UserNotification']))
    {
        //  Simply return this reuqested JSON string
        echo json_encode(
            ['user_notification'=>$_SESSION['UserNotification']]
        );
    }
        //  If it doesn't, add a defailt User Notification message
        //  for users that have not logged in yer
    else
    {
        echo json_encode(
            ['user_notification'=>json_encode(['status' => "ok", 'message' => "Welcome, User, to EZEats Grocery Website. Please feel free to explore"])
        ]);
    }
