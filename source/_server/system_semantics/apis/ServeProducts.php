<?php
    /**
     *  This is called by CategoryPage's script.
     *
     *  It can:
     *      serve all of a single product's information based on the id of that product.
     *      serve some information of every product of the shop in associative arrays.
     *
     *  Serves as JSON
     * 
     *  It chooses what to do based on parameters received from the POSTed request.
    */
    include_once "../../_configure/VerifyRequestMethodPost.php";
    include_once "../../_configure/Database.php";

    $db = new Database();
    $conn = $db->GetConnection();

    $table = $g_GroceryTableName;

    //  Define Functions that Perform Actions

    function ServeSingleProduct($id)
    {
        global $conn, $table;
        $query = "SELECT * FROM $table WHERE id='{$id}'";
        $stmt = $conn->prepare($query);
        $output = [];
        if ($stmt->execute()){
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                foreach ($row as $k=>$v){
                    $output[$k] = $v; 
                }
            }
        }
        echo json_encode($output);
    }

    function ServeAllProductsOfCategory($category)
    {
        global $conn, $table; 
        $query = "select * from $table where category='{$category}' order by id";
        $stmt = $conn->prepare($query);
        //  Normal array but contains associated arrays
        $output = [];
        if ($stmt->execute()){
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                $row_data = [];
                //  Ensure to not add the product's description
                foreach ($row as $k=>$v){
                    if (strcmp($k, "description") != 0){
                        $row_data[$k] = $v; 
                    }
                }
                $output[] = $row_data;
            }
        }
        echo json_encode($output);
    }

    
    //  Determine Actions from POSTed parameters
    $data_as_json = file_get_contents("php://input");
    $data_as_decoded = (array)json_decode($data_as_json);
    $mode = $data_as_decoded['mode'];

    switch ($mode){
        case "SSP":
            ServeSingleProduct($data_as_decoded['product_id']);
            break;
        case "SAPC":
            ServeAllProductsOfCategory($data_as_decoded['category']);
            break;
    }