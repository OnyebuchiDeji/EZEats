<?php
    /**
     * Serves the table of every product to admin.
     * 
     *  May Implement:
     *      Serving only some products:
     *          Serving recently added products:
     *              those whose `date added` info is closest to current date
     *              by a month
     *          Serving only products within a certain criteria:
     *              According to category
     * 
     *  This API, depending on some POSTed parameters, will run different
     *  functions for different results.
     * 
    */
    include_once "../../_configure/Database.php";

    $db = new Database();
    $conn = $db->GetConnection();

    $table = $g_GroceryTableName;

    //  Define Functions that Perform Actions

    function SanitizeInput($in)
    {
        return htmlentities(strip_tags(trim($in)));
    }

    function ServeSingleProduct($id)
    {
        global $conn, $table;
        $id = SanitizeInput($id);
        $query = "SELECT * FROM $table WHERE id='" . $id . "'";
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

    function ServeAllProducts($productsViewMax)
    {
        global $conn, $table; 
        $query = "SELECT * FROM $table ORDER BY id";
        $stmt = $conn->prepare($query);
        //  Normal array but contains associated arrays
        $output = [];
        $data_count = 0;
        if ($stmt->execute()){
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                $row_data = [];
                //  Ensure to not add the product's description
                foreach ($row as $k=>$v){
                    // if (strcmp($k, "description") != 0){
                    // }
                    $row_data[$k] = $v; 
                }
                $output[] = $row_data;
                $data_count += 1;
                if ($productsViewMax >= 0 and $data_count >= $productsViewMax)   
                {
                    break;
                }
            }
        }

        echo json_encode($output);
    }

    /**
     *  Serves Recently Added Products by Day Offset
     */
    function ServeRecentProductsOfPastDays($daysOffset)
    {
        global $conn, $table;
        $daysOffset = SanitizeInput($daysOffset);
        $output = [];
        $query = "SELECT * FROM $table WHERE date_ordered >= NOW() - INTERVAL :dO DAY";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":dO", $daysOffset);
        $stmt->execute();

        if ($stmt->rowCount()>0){
            while ($row=$stmt->fetch(PDO::FETCH_ASSOC)){
                $output = $row;
            }
        }
        else{
            $output = [
                'error'=> "could not get data."
            ];
        }

        echo json_encode($output);
    }

    /**
     *  Serves Recently Added Products by Month Offset
     */
    function ServeRecentProductsOfPastMonths($monthsOffset)
    {
        global $conn, $table;
        $monthsOffset = SanitizeInput($monthsOffset);
        $output = [];
        $query = "SELECT * FROM $table WHERE date_added >= DATE_FORMAT(CURDATE() - INTERVAL :mO MONTH, '%Y-%m-01') 
            AND date_ordered < DATE_FORMAT(CURDATE(), '%Y-%m-01') ORDER BY date_ordered";

        $stmt = $conn->prepare($query);
        $stmt->bindParam("mO", $monthsOffset);
        $stmt->execute();
        if ($stmt->rowCount()>0){
            while ($row=$stmt->fetch(PDO::FETCH_ASSOC)){
                $output = $row;
            }
        }
        else{
            $output = [
                'error'=> "could not get data."
            ];
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
        case "SAP":
            ServeAllProducts($data_as_decoded['products_view_max']);
            break;
        case "SRPPD":
            ServeRecentProductsOfPastDays($data_as_decoded['days_offset']);
            break;
        case "SRPPM":
            ServeRecentProductsOfPastMonths($data_as_decoded['months_offset']);
            break;
    }