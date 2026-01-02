<?php

    /**
     *  This script is in charge of receiving an order
     *  and saving it to the database, then returning 
     *  a json object to acknowledge the order.
     */

    include_once "../../_configure/VerifyRequestMethodPost.php";
    include_once "../../_configure/Database.php";
    include_once "../structures/Customer.php";

    $db = new Database();
    $conn = $db->GetConnection();

    
    $data_as_json = file_get_contents("php://input");
    $data_as_decoded = (array)json_decode($data_as_json);
    
    $info = [
        'customer_email'=> $data_as_decoded['customer_email'],
        'order_info'=> $data_as_decoded['order_info'],
    ];

    foreach ($info as $k=>$v){
        $info[$k] = htmlentities(strip_tags($v));
    }

    $table = $g_OrdersTableName;

    $date_ordered = date('Y-m-d H:i:s');

    $query = "INSERT INTO {$table} (`customer_email`, `order_info`) VALUES(:email, :info)";
    $stmt = $conn->prepare($query);

    $stmt->bindParam(":email", $info['customer_email']);
    $stmt->bindParam(":info", $info['order_info']);
    // $stmt->bindParam(":date", $date_ordered);

    if ($stmt->execute()){
        echo json_encode([
                'status'=> true,
                'message'=>"Order Successful."
        ]);
    }
    else{
        echo json_encode([
                'status'=> false,
                'message'=>"Order Not Successful."
        ]);
    }