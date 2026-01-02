<?php
    /**
     *  It is called by MainPage's script.
     *  Serves every category that every product belongs to.
     * 
     *  How?
     *  It queries the Products table, specifically only the Category header.
     * 
     *  So it gets an associated array of each row's category: category values.
     * 
     *  It loops through this associative array, adding each category to a normal array
     *  ensuring no category name is repeated.
     * 
     *  It then sends/serves this array to the JS that requests this API.

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

    /**
     *  Serves a list of every category a product can belong to.
     *  and also the number of items that belong to that category!
     */
    function ServeProductCategory()
    {
        global $conn; global $table;
        $query = "SELECT * FROM $table ORDER BY id";
        $stmt = $conn->prepare($query);
        $output = [];
        $category_output = [];
        $frequency_output = [];

        if ($stmt->execute()){
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
                $category = trim($row['category']);
                if (!in_array($category, $category_output)){
                    $category_output[] = $category;
                    $frequency_output[] = 1;
                }
                else    //  update frequency
                {
                    // $idx = array_find_key($category_output, function (string $category_value){
                    //     global $category;
                    //     return strcmp($category_value, $category) == 0;
                    // });
                    $idx = array_search($category, $category_output);
                    $frequency_output[$idx] += 1;
                }
            }
            $output['category_array'] = $category_output;
            $output['frequency_array'] = $frequency_output;
        }
        echo json_encode($output);
    }

    ServeProductCategory();