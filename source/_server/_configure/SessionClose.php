<?php
    /**
     * This php script is used if a user logs out.
     * 
     *  It makes sure to generate a new session id on client's browser
     *  when these are run.
    */
    session_start();
    //  unsets all session variables
    session_unset();
    session_destroy();