<?php


    include_once "../../_configure/VerifyRequestMethodPost.php";
    include_once "../../_configure/SessionStart.php";

    if (isset($_SESSION['email']))
    {
        echo json_encode([
            'status'=>true,
            'email'=>$_SESSION['email']
        ]);
    }
    else
    {
        echo json_encode([
            'status'=>false,
            'email'=>"none"
        ]);    
    }