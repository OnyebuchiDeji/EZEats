<?php

    include_once "./VerifyRequestMethodPost.php";
    include_once "./Database.php";

    /**
     *  Old Way
     *  
     *   function DoesTableExist($conn, $table_name): bool
     *   {
     *       //  Check if table exists!
     *       $existsQuery = "show tables";
     *       $qHandle = $conn->prepare($existsQuery);
     *
     *       if ($qHandle->execute())
     *       {
     *           while($row = $qHandle->fetch(PDO::FETCH_ASSOC)){
     *               foreach($row as $k=>$res_table_name)
     *               {
     *                   //  If that table name already exists in the list of table names!!
     *                   if (strcmp($res_table_name, $table_name) == 0)
     *                   {
     *                       // echo json_encode(
     *                       // [
     *                       //     "status"=> false,
     *                       //     "message"=>"Table {$table_name} already exists!"
     *                       // ]);
     *                       return true;
     *                   }
     *               }
     *           }
     *       }
     *       return false;
     *   }
    */
    function DoTablesExist($conn, $table_names): bool
    {
        //  Check if table exists!
        $existsQuery = "show tables";
        $qHandle = $conn->prepare($existsQuery);
        $exists = true;

        if ($qHandle->execute())
        {
            $row_arr = [];
            while($row = $qHandle->fetch(PDO::FETCH_ASSOC)){
                foreach ($row as $k=>$res_table_name)
                {
                    $row_arr[] = $res_table_name;   //  turn to array of table names
                }
            }
            foreach ($table_names as $table_name)
            {
                //  If that table name already exists in the list of table names!!
                $exists = $exists & in_array($table_name, $row_arr);
            }
        }
        return $exists;
    }

    function VerifyTablesExist()
    {
        $db = new Database();
        $conn = $db->GetConnection();

        global $g_GroceryTableName;
        global $g_CaptchaImageTableName;
        global $g_CustomersTableName;
        global $g_OrdersTableName;
        
        $exists = true;
        // $exists &= DoesTableExist($conn, $g_GroceryTableName);
        // $exists &= DoesTableExist($conn, $g_CaptchaImageTableName);
        // $exists &= DoesTableExist($conn, $g_CustomersTableName);
        $exists &= DoTablesExist($conn, 
                        [$g_GroceryTableName, $g_CaptchaImageTableName,
                                     $g_CustomersTableName, $g_OrdersTableName]);
    
        if ($exists)
        {
            echo json_encode([
                'status' => true,
                'message' => "Some or All Tables Do Exist"
            ]);
            return;
        }
        echo json_encode([
            'status'=> false,
            'message' => "Some or All Tables Do Not Exist"

        ]);
        return;
        // return $exists;
    }

    VerifyTablesExist();