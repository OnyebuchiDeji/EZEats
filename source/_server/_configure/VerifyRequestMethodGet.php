
<?php
    /**
     *  Does as the name implies
    */
    if (strcasecmp($_SERVER["REQUEST_METHOD"], "get") != 0){
        echo json_encode([
            "Error"=> "Bad Request Method. Must be GET"
        ]);
        exit;
    }