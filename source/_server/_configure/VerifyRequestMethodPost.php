
<?php
    /**
     *  Does as the name implies
    */
    if (strcasecmp($_SERVER["REQUEST_METHOD"], "post") != 0){
        echo json_encode([
            "Error"=> "Bad Request Method. Must be POST"
        ]);
        exit;
    }