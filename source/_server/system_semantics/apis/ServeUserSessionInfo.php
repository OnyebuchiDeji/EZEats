<?php
    include_once "../../_configure/VerifyRequestMethodPost.php";
    include_once "../../_configure/SessionStart.php";

    echo json_encode($_SESSION);