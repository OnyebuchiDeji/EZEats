<?php
    include_once "../../_configure/VerifyRequestMethodGet.php";
    include_once "../../_configure/Database.php";

    $db = new Database();
    $conn = $db->GetConnection();
    
    #   Use $conn to connect to the Captcha Table
    #   and obtain an array of these captcha images.
    $query = "SELECT captcha_image_filename from {$g_CaptchaImageTableName}";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $arr = [];
    if ($stmt->rowCount() >0)
    {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            $arr[] = $row['captcha_image_filename'];
        }
    }else{
        echo json_encode([
            "Error"=>"Couldn't Load Captcha! Table Empty.<br>"
        ]);
    }
    
    /**
     *    this rand generates random values between
     *    v1 and v2, with v2 included. So index incase of v2
     *    given count gives size, should be - 1
     */
    $captcha_choice = $arr[rand(0, count($arr) - 1)];
    // echo "Choice: " . $captcha_choice . "<br/>";
    
    echo json_encode([
        'random_captcha_image_name'=>$captcha_choice
    ]);