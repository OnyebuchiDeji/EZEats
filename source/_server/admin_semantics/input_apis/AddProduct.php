<?php
    /**
     *  Adds a product to database to display in shop.
     *  the information is received from admin.
    */
    include_once "../../_configure/Database.php";
    include_once "../structures/Product.php";


    $table = $g_ProductsTable;
    
    $conn = new Database()->GetConnection();

    $query = "INSERT INTO $table (`category`, `subcategory`, 
        `name`, `price`, `details`, `description`, `image_name`) 
        VALUES (:cat, :subcat, :nm, :price, :dets, :descrip, :imgname)";
    
    $info = [
        'category'=>$_POST['category'],
        'subcategory'=>$_POST['subcategory'],
        'name'=>$_POST['name'],
        'price'=>$_POST['price'],
        'details'=>$_POST['details'],
        'description'=>$_POST['description'],
        'image_name'=>$_POST['image_name'],
    ];
    
    // $date_added = date('Y-m-d H:i:s');

    //  Product Info
    $pI = new Product($info)->GetInfo();

    $stmt = $conn->prepare($query);
    $stmt->bindParam(":cat", $pI['category']);
    $stmt->bindParam(":subcat", $pI['subcategory']);
    $stmt->bindParam(":nm", $pI['name']);
    $stmt->bindParam(":price", $pI['price']);
    $stmt->bindParam(":dets", $pI['details']);
    $stmt->bindParam(":descrip", $pI['description']);
    $stmt->bindParam(":imgname", $pI['image_name']);

    $output = [];

    if ($stmt->execute()){
        $output = [
            "status"=>"good",
            "message"=>"Successfully Added Product of name {$pI['name']}"
        ];
        $_SESSION['UserNotification']=json_encode([
            'status'=>"good",
            'message'=>"Successfully Added Product"
        ]);
    }
    else
    {
        $output = [
            "status"=>"bad",
            "message"=>"Couldn't Add Product of name {$pI['name']} to Database. Try Again."
        ];
        $_SESSION['UserNotification']= json_encode([
            'status'=>"bad", 'message'=>"Failed to Add Product."
        ]);
    }
    
    echo json_encode($output);
