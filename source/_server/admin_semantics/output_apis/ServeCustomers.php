<?php
    
    include_once "../../_configure/Database.php";

    $db = new Database();
    $conn = $db->GetConnection();

    $table = $g_CustomersTableName;

    function ServeAllCustomers($customersViewMax)
    {
        global $conn, $table; 
        $query = "SELECT id, username, firstname, lastname, phone, email FROM $table ORDER BY id";
        $stmt = $conn->prepare($query);
        //  Normal array but contains associated arrays
        $output = [];
        $data_count = 0;
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
                $data_count += 1;
                if ($customersViewMax >= 0 and $data_count >= $customersViewMax)   
                {
                    break;
                }
            }
        }

        echo json_encode($output);
    }

    //  Determine Actions from POSTed parameters
    $data_as_json = file_get_contents("php://input");
    $data_as_decoded = (array)json_decode($data_as_json);
    $mode = $data_as_decoded['mode'];


    switch ($mode){
        case "SAC":
            ServeAllCustomers($data_as_decoded['customers_view_max']);
            break;
    }