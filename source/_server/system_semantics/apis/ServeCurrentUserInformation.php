<?php
    /**
     * This is requested by the UserInfo JS Script.
     * 
     *  It serves the information of the current user
    */
    include_once "../../_configure/VerifyRequestMethodGet.php";
    include_once "../../_configure/SessionStart.php";

    echo json_encode(
        [
            "name"=> $_SESSION['name'],
            "email"=> $_SESSION['email'],
            "phone"=> $_SESSION['phone'],
        ]);