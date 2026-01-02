<?php
    /**
     *   Contains the functions for initializing the database
     *   by creating tables of the Grocery List from the csv file
     *   and the Captcha Images.
     *   
     *   It also exposes the functions that do that to the admin
     *   so they can update the database!
    **/

    include_once "../../_configure/Database.php";

    /**
     * @param mixed $conn
     * @param mixed $table_name
     * @return bool
     * 
     * Used to check if a specific table exists
     * 
     */
    function DoesTableExist($conn, $table_name): bool
    {
        //  Check if table exists!
        $existsQuery = "show tables";
        $qHandle = $conn->prepare($existsQuery);

        if ($qHandle->execute())
        {
            while($row = $qHandle->fetch(PDO::FETCH_ASSOC)){
                foreach($row as $k=>$res_table_name)
                {
                    //  If that table name already exists in the list of table names!!
                    if (strcmp($res_table_name, $table_name) == 0)
                    {
                        echo json_encode(
                        [
                            "status"=> false,
                            "message"=>"Table {$table_name} already exists!"
                        ]);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function CreateTable($conn, $table_name, $table_headers_string, $extra_clause="")
    {
        if (DoesTableExist($conn, $table_name))
        {
            return true;
        }

        //  Create Table
        $extraClauseCommand = strlen($extra_clause) > 0 ? " {$extra_clause}" : "";
        $createTableCommand = "create table " . $table_name . " " . $table_headers_string . ";" . $extraClauseCommand;

        $createTableCommandHandle = $conn->prepare($createTableCommand);

        if (!$createTableCommandHandle->execute())
        {
            echo json_encode(
            [
                "status"=> false,
                "message"=>"Failed to Create Table {$table_name}"
            ]);
            exit;
        }
        return true;
    }

    /**
     * shouldDrop if true, specifies to delete whole table.
     * else, table will just be emptied but it's header fields will still be the same.
     */
    function DeleteTable($conn, $table_name, $shouldDrop=true)
    {
        //  Delete table command
        //  `truncate` empties the table rather than deleting the whole thing
        //  `drop` deletes the whole thing so
        $deleteTableCommand = "";
        if ($shouldDrop)
        {
            $deleteTableCommand = "drop table {$table_name}";
        }
        else
        {
            $deleteTableCommand = "truncate table {$table_name}";
        }

        $deleteTableCommandHandle = $conn->prepare($deleteTableCommand);

        if ($deleteTableCommandHandle->execute())
        {
            echo json_encode(
            [
                "status"=> false,
                "message"=>"Failed to Create Table {$table_name}"
            ]);
        }
    }

    /**
     *  It opens a table and select all records from the table.
     *  It checks if there are any records in this table.
     * 
     *  If there are, it will return false. If not, it will return true
     */
    function ShouldPopulateTable($conn, $table_name)
    {
        $selectInstruction = "select * from {$table_name}";
        $instructionHandle = $conn->prepare($selectInstruction);
        if ($instructionHandle->execute())
        {
            //  check if there are any records
            if ($instructionHandle->rowCount() > 0)
                return false;
        }
        return true;
    }

    function CreateCaptchaTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();

        global $g_CaptchaImageTableName;
        $tableName = $g_CaptchaImageTableName;
        
        $headers_string = "id int, captcha_image_text varchar(20), captcha_image_filename varchar(255)";
        CreateTable($conn, $tableName, "({$headers_string})");

        return "id, captcha_image_text, captcha_image_filename";
    }



    /**
     * Read all the file names in resources/CaptchaImages
     * and use it to create the new EZEatsCaptchaImagesTable in the database 
     * This table simply contains the id and names each image.
     * 
     * If the table already exists, it returns!
    */
    function PopulateCaptchaTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();

        //  Create Table
        $insertHeadersString = CreateCaptchaTable();

        global $g_CaptchaImageTableName;
        $tableName = $g_CaptchaImageTableName;
        
        
        //  read csv file and make array
        $fstream = fopen("../../../../resources/CaptchaImages/captcha_text.csv", "r");
        $idx = 0;
        $captcha_images_text = [];
        while ($line_arr = fgetcsv($fstream))
        {
            if ($idx == 1)   //  for second row
            {
                $captcha_images_text = $line_arr;
            }
            $idx += 1;
        }

        $dirHandle = opendir("../../../../resources/CaptchaImages/");
        $dataToSave = [];
        $idx = 0;
        //  read the directory's contents
        while(($fileName = readdir($dirHandle)) !== false)
        {
            // $explodedName = explode(".", $fileName)[1];
            //  could do str_ends_with()
            // if (strcmp($explodedName, "jpg") == 0){

            if (!str_ends_with($fileName, ".jpg")){
                continue;
            }

            $dataToSave[] = ['id'=>$idx,
                            'captcha_image_text'=>trim($captcha_images_text[$idx]),
                            'captcha_image_filename'=>$fileName];
            $idx += 1;
        }
        closedir($dirHandle);

        if (ShouldPopulateTable($conn, $tableName) == false)
        {
            return;
        }
        
        $insertCommand = "insert into {$tableName} ({$insertHeadersString}) values ";
        $length = sizeof($dataToSave);
        $idx = 0;
        foreach($dataToSave as $record)
        {
            $idx += 1;
            $insertCommand .= "('{$record['id']}', '{$record['captcha_image_text']}', '{$record['captcha_image_filename']}')";
            if ($idx < $length){
                $insertCommand .= ", ";
            }
        }
        
        $insertCommand .= ";";
        
        echo "<br>";
        echo $insertCommand;
        
        $insertCommandHandle = $conn->prepare($insertCommand);
        if ($insertCommandHandle->execute())
        {
            echo json_encode(
                [
                    "status"=> true,
                    "message"=>"Created Captcha Table Successfully!"
                ]
            );
        }
    }

    function UpdateCaptchaTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();

        global $g_CaptchaImageTableName;
        $tableName = $g_CaptchaImageTableName;
        
        DeleteTable($conn, $tableName, true);
        //  Then Recreate!
        PopulateCaptchaTable();
    }

    /**
     * 
     * Creates the specified table
     * 
     * If the table already exists, it returns!
     * This reads the first line of the csv file
     * to get the table's header row names and then
     * infers the types of each header field from the
     * csv file's second line's field values
     * and then uses those to create the table 
     */
    function CreateGroceryTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();
        
        global $g_GroceryTableName;
        $tableName = $g_GroceryTableName;

        if (DoesTableExist($conn, $tableName))
        {
            return;
        }

        //  read csv
        $fstream = fopen("../../../../resources/grocery_products_updated.csv", "r");
        //  Get First Line Only
        //  Build Insert Header String
        $first_line_arr = fgetcsv($fstream);
        $insertHeaderString = "";   //  Contains just the header column names
        $arr_length = sizeof($first_line_arr);
        for($idx = 0; $idx < $arr_length; $idx += 1)
        {
            $header_name = trim($first_line_arr[$idx]);
            $insertHeaderString .= $idx + 1 < $arr_length ? "{$header_name}, " : $header_name;
        }
        
        //  Must be updated manually!
        $type_list = [];

        //  used to get the types of digits!
        $second_line_arr = fgetcsv($fstream);
        foreach($second_line_arr as $field)
        {
            if (is_numeric($field))
            {
                //  Check if string has as decimal point
                if (str_contains($field, "."))
                {
                    //  interpreting a double as float. the first parameter indicates the max
                    //  number of digits. the second, indincates the max number
                    //  of digits after the decimal point.
                    $type_list[] = "float(3, 2)";
                }
                else
                {
                    $type_list[] = "int";
                }
            }
            else{
                $type_list[] = "varchar(255)";
            }
        }

        //  construct final table headers string
        //  having both header column names and types, needed
        //  to create the table
        $createHeadersString = "";
        // $headers_string = "(";
        for ($idx=0; $idx < $arr_length; $idx += 1)
        {
            $field_name = trim($first_line_arr[$idx]);
            $val =  "{$field_name} {$type_list[$idx]}";
            $createHeadersString .= $idx + 1 < $arr_length ? "{$val}, " : $val;
        }
            
        // $createHeadersString .= ")";

        fclose($fstream);

        // echo $line_str;
        CreateTable($conn, $tableName, "({$createHeadersString})");

        return $insertHeaderString;
    }

    /**
     * This reads the csv file and creates a new 'EZEatsGrocery' Table
     * 
     * 
    **/
    function PopulateGroceryTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();
        
        global $g_GroceryTableName;
        $tableName = $g_GroceryTableName;

        $insertHeadersString = CreateGroceryTable();

        //  Get every record from csv file and concactenate it into one string 
        //  in the format usef by SQL to insert into a database
        $insertValuesString = "";
        $fstream = fopen("../../../../resources/grocery_products_updated.csv", "r");
        $count = -1;
        while ($line_arr = fgetcsv($fstream))
        {
            $count += 1;
            if ($count <= 0) continue;  //skip first line which is the header information
            $line_str = "(";
            $arr_length = sizeof($line_arr);
            for($idx = 0; $idx < $arr_length; $idx += 1)
            {
                $val = trim($line_arr[$idx]);
                $line_str .= $idx + 1 < $arr_length ? "'{$val}', " : "'{$val}'";
            }
            $line_str .= "), ";
            $insertValuesString .= $line_str;
        }
        
        //  remove trailing space and comma at the end and replace with ';'
        $insertValuesString = substr($insertValuesString, 0, -2);
        $insertValuesString .= ";";

        if (ShouldPopulateTable($conn, $tableName) == false)
        {
            return;
        }

        $insertCommand = "insert into {$tableName} ({$insertHeadersString}) values {$insertValuesString}";
        $insertCommandHandle = $conn->prepare($insertCommand);
        if ($insertCommandHandle->execute())
        {
            echo json_encode(
                [
                    "status"=> true,
                    "message"=>"Populated Grocery Table Successfully!"
                ]
            );
        }

        fclose($fstream);
    }

    /**
     *  There are two ways to update the Grocery List table.
     *  1. Delete the table of the same name in the mysql server
     *      and re-add all the items from the csv file into a newly
     *      created table of the same name
     *  2.  Loop through each record of the table, ignoring those that already
     *      exist in the csv file, and add those to the table that don't yet exist
     *      int it.
     *  
     *  Choice: option 1.
     *  I'm going for option 1. because If a value of an already existing
     *  item changes, I won't want to also implement the strenous logic of checking
     *  if an already-exsiting item in the mysql db has changed when compared to that
     *  same value and id in the csv file! 
    */
    function UpdateGroceryTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();

        global $g_GroceryTableName;
        $tableName = $g_GroceryTableName;
        
        DeleteTable($conn, $tableName, true);

        //  Then Recreate!
        PopulateGroceryTable();
    }

    /**
     *  For Customers and Orders
    */

    function CreateCustomersTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();
        
        global $g_CustomersTableName;
        $tableName = $g_CustomersTableName;

        if (DoesTableExist($conn, $tableName))
        {
            return;
        }

        //  15 is the max possible length of a phone number
        //  but to accommosdat the prepended formatting symbols
        //  like plus (+), hyphens(-). and spaces (), make it 30
        //  lastly, note that a primary key constraint needs to be defined
        //  especially to specify >` column as a primary key!
        //  this allows dropoing the primary key constraint, e.g. `DEOP pk_user`
        $createHeadersString = "id int not null auto_increment, username varchar(124) not null,
            firstname varchar(255), lastname varchar(255), phone varchar(30), email varchar(255) not null, password varchar(255),
            constraint pk_user primary key (id, email)";
        
        // echo $line_str;
        $status = CreateTable($conn, $tableName, "({$createHeadersString})");
        if ($status)
        {
            echo json_encode(
                [
                    "status"=> true,
                    "message"=>"Created Customers Table Successfully!"
                ]
            );
        }
    }
    
    function CreateOrdersTable()
    {
        $db = new Database();
        $conn = $db->GetConnection();
        
        global $g_OrdersTableName;
        $tableName = $g_OrdersTableName;

        if (DoesTableExist($conn, $tableName))
        {
            return;
        }

        $createHeadersString = "id int not null auto_increment, customer_email varchar(255) not null,
            order_info varchar(4096),
            date_ordered timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            date_delivered timestamp,
            constraint pk_order primary key (id, customer_email)";

        $extraClause = "alter table {$tableName} add index idx_datetime (date_ordered)";
        
        // echo $line_str;
        $status = CreateTable($conn, $tableName, "({$createHeadersString})", $extraClause);
        
        if ($status)
        {
            echo json_encode(
                [
                    "status"=> true,
                    "message"=>"Created Orders Table Successfully!"
                ]
            );
        }
    }
    
    
    //  Determine Actions from POSTed parameters
    $data_as_json = file_get_contents("php://input");
    //  It has to be cast because after decoding, it's and objectArray
    //  which is not subscriptable as a normal array or associative array is
    $data_as_decoded = (array)json_decode($data_as_json);
    $mode = $data_as_decoded['mode'];
    // echo $mode;


    switch ($mode){
        case "create-customers-table":
            CreateCustomersTable();
            break;
        case "create-orders-table":
            CreateOrdersTable();
            break;
        case "create-captcha-table":
            PopulateCaptchaTable();
            break;
        case "update-captcha-table":
            UpdateCaptchaTable();
            break;
        case "create-grocery-table":
            PopulateGroceryTable();
            break;
        case "update-grocery-table":
            UpdateGroceryTable();
            break;
    }