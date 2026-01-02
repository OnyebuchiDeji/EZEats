<?php
    /**
     *  This API is accessed by the admin.
     * 
     *  It has control of serving order information.
     * 
     *  It can do these:
     *      -   Serve a single order based on order id.
     *      -   Serve all orders of a particular customer
     *      -   Serve recent orders within a month from current date
     *      -   Serve orders within a certain date range.
     * 
     *  It uses functions to perform different activities.
     *  Which function is run depends on the POSTed parameters
     *  the admin client sends.
    */
    include_once "../../_configure/Database.php";

    $db = new Database();
    $conn = $db->GetConnection();

    $table = $g_OrdersTableName;


    /**
     * Mode: SSOI
     */
    function ServeSingleOrderOfId($id)
    {
        global $conn, $table; 
        $output = [];
        $query = "SELECT * FROM $table WHERE id=:id LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        //  Only returns one row because of id is used.
        if ($stmt->rowCount()>0){
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            foreach($row as $k=>$v){
                $output[$k] = $v;
            }
        }
        echo json_encode($output);
    }

    /**
     * Mode: SAC
     */
    function ServeAllOrders($ordersViewMax)
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
                    if (strcmp($k, "description") != 0){
                        $row_data[$k] = $v; 
                    }
                }
                $output[] = $row_data;
                $data_count += 1;
                if ($ordersViewMax >= 0 and $data_count >= $ordersViewMax)   
                {
                    break;
                }
            }
        }

        echo json_encode($output);
    }
    

    /**
     *  Serves an array of all the rows of order information (in an associated array)
     *  belonging to the customer with that email
     *  
     *  MODE: SAOC
     */
    function ServeAllOrdersOfCustomer($customerEmail)
    {
        global $conn, $table;
        $output = [];
        $query = "SELECT * FROM $table WHERE customer_email=:email LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":email", $customerEmail);

        $stmt->execute();
        if ($stmt->rowCount() > 0){
            while ($row=$stmt->fetch(PDO::FETCH_ASSOC)){
                $output[] = $row;
            }
        }
        else{
            $output = [
                'error'=> "could note get data."
            ];
        }


        echo $output;
    }


    /**
     *  SELECT * FROM your_table
     *      WHERE your_datetime_column >= NOW() - INTERVAL X DAY;
     * 
     * OR
     * 
     *  SELECT * FROM your_table
     *      WHERE your_datetime_column >= DATE_SUB(NOW(), INTERVAL X DAY);
     * 
     * 
     *  MODE: SROPD
     * 
     */
    function ServeRecentOrdersOfPastDays($daysOffset)
    {
        global $conn, $table;
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
     * 
     *  SELECT * FROM your_table
     *  WHERE your_datetime_column >= '2025-03-01 00:00:00' 
     *  AND your_datetime_column < '2025-04-01 00:00:00';
     *
     *  MODE: SOWDR
     */
    function ServeOrdersWithinDateRange($dStart, $dEnd)
    {
        global $conn, $table;
        $output = [];
        $query = "SELECT * FROM $table WHERE date_ordered >= DATE_FORMAT(:dstart, '%Y-%m-01') 
            AND date_ordered < DATE_FORMAT(:dend, '%Y-%m-01') ORDER BY date_ordered";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":dstart", $dStart);
        $stmt->bindParam(":dend", $dEnd);
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
     *  Serves an Array of Associated list of orders
     *  SELECT * FROM your_table
     *      WHERE your_datetime_column >= DATE_FORMAT(CURDATE(), '%Y-%m-01') 
     *      AND your_datetime_column < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01');
     * 
     *  MODE: SOSM
     */
    function ServeOrdersOfSpecificMonth($month)
    {
        global $conn, $table;
        $output = [];
        $query = "SELECT * FROM $table WHERE date_ordered >= DATE_FORMAT(:mO1, '%Y-%m-01') 
            AND date_ordered < DATE_FORMAT(:mO2 + INTERVAL 1 MONTH, '%Y-%m-01') ORDER BY date_ordered";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mO1", $month);
        $stmt->bindParam(":mO2", $month);
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
     *  
     * 
     *  SELECT * FROM your_table
     *  WHERE your_datetime_column >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
     *  AND your_datetime_column < DATE_FORMAT(CURDATE(), '%Y-%m-01');
     */
    function ServeRecentOrdersOfPastMonths($monthsOffset)
    {
        global $conn, $table;
        $output = [];
        $query = "SELECT * FROM $table WHERE date_ordered >= DATE_FORMAT(CURDATE() - INTERVAL :mO MONTH, '%Y-%m-01') 
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


    //  Determine Which To Call Based on POSTed Parameters

    $data_as_json = file_get_contents("php://input");
    $data_as_decoded = (array)json_decode($data_as_json);
    $mode = $data_as_decoded['mode'];

    switch ($mode)
    {
        case 'SSOI':
            ServeSingleOrderOfId($data_as_decoded['id']);
            break;
        case 'SAO':
            ServeAllOrders($data_as_decoded['orders_view_max']);
            break;
        case 'SAOC':
            ServeAllOrdersOfCustomer($data_as_decoded['email']);
            break;
        case 'SROPD':
            ServeRecentOrdersOfPastDays($data_as_decoded['days_offset']);
            break;
        case 'SOWDR':
            ServeOrdersWithinDateRange($data_as_decoded['start_date'], $data_as_decoded['end_date']);
            break;
        case 'SOSM':
            ServeOrdersOfSpecificMonth($data_as_decoded['month']);
            break;
        case 'SROPM':
            ServeRecentOrdersOfPastMonths($data_as_decoded['month_offset']);
            break;
    }