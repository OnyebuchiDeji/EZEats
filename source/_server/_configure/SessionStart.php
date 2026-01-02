<?php
    /**
     *  Ensures sessions have started
     *  `ini_set()` ensures tighter security
     * 
     * 
     *  Sources of Inspiration:
     *      For Session and Cookies - https://stackoverflow.com/a/6360403
     *      For How Session Ids are Created - https://www.php.net/manual/en/function.session-create-id.php
     *      For Random String - https://www.geeksforgeeks.org/php/generating-random-string-using-php/a
     *      For Why No Need to Specify Hashes on Session Ids - https://www.php.net/manual/en/session.configuration.php#ini.session.hash-function
     * 
    */
    
    function SessionRestart()
    {
        session_destroy();

        ini_set('session.use_strict_mode', 1);
    
        session_set_cookie_params(3600);    //  set session lifetime to 1 hour
    
        session_start();

        session_regenerate_id();
    }
    
    function SessionStart()
    {
        ini_set('session.use_strict_mode', 1);
    
        session_set_cookie_params(3600);    //  set session lifetime to 1 hour
    
        session_start();
    }
    
    
    //  Method 2
    function GenerateRandomStringBasic($len)
    {
        $characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        $randStr = "";

        for ($i = 0; $i < $len; $i++)
        {
            $idx = random_int(0, strlen($characters) - 1);
            $randStr .= $characters[$idx];
        }

        return $randStr;
    }
    
    //  Method 3: Less Cool
    function GenerateRandomStringUsingUniqueId()
    {
        return uniqid();
    }

    //  Method 1: Best in My Opinion
    function GenerateRandomString($len)
    {
        return bin2hex(random_bytes($len));
    }
    
    /**
     *  The below uses cookies to save the Session Information
     *  on the client side for prolonged session data retention.
     * 
     *  This allows things such as "Rememver Login"
     * 
     */
    
    function ProlongSessionLifetime()
    {
        $date_split = explode("-", date("Y-m-d"));
        $date_sum = (int)$date_split[0] + (int)$date_split[1] + (int)$date_split[2];
        $sessionId = session_create_id(GenerateRandomString($date_sum));
        
        //  The session hash is the hash of the another generated session id --- no source, just me
        //  no need for session hashes since php uses hash md5 on session ids by default
        // $sessionHash = hash("sha-256", session_create_id(GenerateRandomString($date_sum)));
        
        setcookie('sessid', $sessionId, 604800);      // One week or seven days
        // setcookie('sesshash', $sessionHash, 604800);  // One week or seven days
        
        // And save the session data:
        $_COOKIE['sessid'] = serialize($_SESSION); //  stores all current session data
    }

    function ValidateProlongedSessionOnLogin()
    {
        global $_SESSION;
        if (isset($_COOKIE['sessid'])) {
            $_SESSION = unserialize($_COOKIE['sessid']);
            return true;
        }
        return false;
    }


    SessionStart();