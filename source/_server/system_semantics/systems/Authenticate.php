<?php
    /**
     *  Authenticates a user trying to login.
    */
    include_once "../../_configure/VerifyRequestMethodPost.php";
    include_once "../../_configure/Database.php";
    include_once "../structures/Customer.php";

    
    $db = new Database();
    $conn = $db->GetConnection();

    $info = [
        'email' => $_POST['email'],
        'password'=>$_POST['password'],
        'captcha_input'=>$_POST['captcha_input']
    ];

    //  customer info
    $customer = new Customer($info);
    $ci = $customer->GetInfo();

    //  Verify Captcha to continue
    $verified = false;  
    $selectQuery = "select * from {$g_CaptchaImageTableName} where captcha_image_text='{$ci['captcha_input']}'";

    $selectCmd = $conn->prepare($selectQuery);

    
    if ($selectCmd->execute())
    {
        $verified = $selectCmd->rowCount() > 0 ? true : false;
    }
    if (!$verified)
    {
        $_SESSION['UserNotification'] = json_encode([
            'status'=>"bad", 'message'=>"Captcha Failed. Please Try Again."
        ]);
        header("Location: " . $g_CSSI . "LoginPage.html");
    }

    
    $table = $g_CustomersTableName;

    /**
     *  Function to Check if Customer is Admin
     *  So, after verifying, the verified data is compared
     *  with the admin specifications in the .env file
     *  that remains hidden in the server.
     *  If it matches, the `admin` session variable is set to true.
     *  When the user logs in, the `AdminAuthorise` JS script is run
     *  that checks this variable. 
    */
    function isAdmin($username, $phone, $email){
        $envFile = parse_ini_file(dirname(__FILE__) . "/../../admin_semantics/.env");
        $adminName = htmlentities(strip_tags(trim($envFile['admin_username'])));
        $adminPhone = htmlentities(strip_tags(trim($envFile['admin_phone'])));
        $adminEmail = htmlentities(strip_tags(trim($envFile['admin_email'])));

        $isAdmin = false;
        
        $isAdmin = strcmp($username, $adminName) == 0 ? true:false;
        $isAdmin = strcmp($phone, $adminPhone) == 0 ? true:false;
        $isAdmin = strcmp($email, $adminEmail) == 0 ? true:false;

        return $isAdmin;
    }

    $query = "SELECT `id`, `username`, `firstname`, `lastname`, `phone`, `email`, `password` FROM $table 
    WHERE email=:email LIMIT 1";

    $exists = false;
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $ci['email']);

    // $stmt->bindColumn ---    could use like mysqli->bind_result
    
    if ($stmt->execute()){
        //  There should be just one row since emails are unique
        $row = $stmt->rowCount()>0 ? $stmt->fetch(PDO::FETCH_ASSOC) : ['message'=>"error"];
            
        if (password_verify($ci['password'], $row['password'])){
            $exists = true;
            //  Ensure to access session variables and to generate a new session id for the now logged-in user 
            SessionRestart();
            //  set this session variable, `id`, to be that of the new session id.
            //  to uniquely keep this user's session until logout
            // $_SESSION['id'] = session_id();
            $_SESSION['id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['firstname'] = $row['firstname'];
            $_SESSION['lastname'] = $row['lastname'];
            $_SESSION['phone'] = $row['phone'];
            $_SESSION['email'] = $row['email'];
            $_SESSION['is_admin'] = false;
            if (isAdmin($row['username'], $row['phone'], $row['email'])){
                $_SESSION['is_admin'] = true;
            }
        }
    }

    if ($exists){
        $_SESSION['UserNotification'] = json_encode(['status'=>"good", 'message'=>"Welcome to EZEats Website."]);
        header("Location: " . $g_CSSI . "MainPage.html");
    }
    else{
        $_SESSION['UserNotification'] = json_encode(['status'=>"bad",'message'=>"Log in failed. Check your email or password and try again."]);
        header("Location: " . $g_CSSI . "LoginPage.html");
    }

