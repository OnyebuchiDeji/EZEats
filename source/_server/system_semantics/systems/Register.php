<?php
    /**
     *  Registers a user if they don't already exist trying to login.
    */

    include_once "../../_configure/VerifyRequestMethodPost.php";
    include_once "../../_configure/Database.php";
    include_once "../structures/Customer.php";

    $db = new Database();
    $conn = $db->GetConnection();

    $info = [
        'username'=>$_POST['username'],
        'firstname'=>$_POST['firstname'],
        'lastname'=>$_POST['lastname'],
        'phone'=>$_POST['phone'],
        'email' => $_POST['email'],
        'password'=>$_POST['password']
    ];

    //  customer info
    $customer = new Customer($info);
    $ci = $customer->GetInfo();
    
    $table = $g_CustomersTableName;

    /**
     *  The default hash is the bcript as of Php 8.3
     */
    $hashed_pwd = password_hash($ci['password'], PASSWORD_DEFAULT);

    function alreadyExists(){
        global $ci;
        global $table;
        // global $hashed_pwd;
        global $conn;

        $query = "SELECT * FROM {$table} WHERE username='{$ci['username']}'
            AND email='{$ci['email']}' AND phone='{$ci['phone']}'";

        $stmt = $conn->prepare($query);
        //  execute
        $stmt->execute();
        
        return $stmt->rowCount() > 0 ? true : false; 
        
    }

    if (alreadyExists()){
        $_SESSION['UserNotification'] = json_encode([
            'status'=>"bad",
            'message'=>"Registry Failed. The email or username or phone you entered already exists. Ensure to use your information."
        ]);

        header("Location: " . $g_CSSI . "RegisterPage.html");
    }
    else{
        $query = "INSERT INTO " . $table . "(username, firstname, lastname, phone, email, password) 
            VALUES(:username, :firstname, :lastname, :phone, :email, :password)";

        $stmt = $conn->prepare($query);
    
        $stmt->bindParam(":username", $ci['username']);
        $stmt->bindParam(":firstname", $ci['firstname']);
        $stmt->bindParam(":lastname", $ci['lastname']);
        $stmt->bindParam(":phone", $ci['phone']);
        $stmt->bindParam("email", $ci['email']);
        $stmt->bindParam(":password", $hashed_pwd);

        if( $stmt->execute()){
            $_SESSION['UserNotification'] = json_encode([
                'status'=>"good",
                'message'=>"You have been registered successfully. Now you can log in."
            ]);
            header("Location: " . $g_CSSI . "LoginPage.html");
        }

    }
