<?php
    session_start();
    session_destroy();
    header("Location: ../../../_client/system_interface/LoginPage.html");
    exit();