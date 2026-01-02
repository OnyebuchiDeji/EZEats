<?php
    /**
     *  The database structure.
     * 
     *  Here, the PDO, Php Data Object is the way the database is accessed.
     * 
     *  Had to find out that a PDO object is not the same as a `mysqli` object.
     * 
     *  The PDO object's `prepare()` method returns a PDO statement.
     *  BUt a mysqli object retunrs a mysqli statement
     *  This PDO stament does not have methods like:
     *      bind_param("ssss", $ci['name'], $ci['phone'], $ci['email'], $hashed_pwd);
     *      bind_result()...
     *  and the PDO object doesn't have:
     *      PDO()->close() or PDO()->error;
     * 
     *  Instead, it's bind_param works like this:
     *      $query = "INSERT INTO " . $this->table_name . " SET 
     *          username=:username, password=:password, created=:created";
     *  
     *       $stmt = $this->conn->prepare($query);
     *        // bind values
     *       $stmt->bindParam(":username", $this->username);
     *       $stmt->bindParam(":password", $this->password);
     *       $stmt->bindParam(":created", $this->created);
     *
     *  Also, it's $conn->prepare() still returns a bool
     *  But, it's the PDO statement's execute that is used in if conditions
     *  Though both can be used.
     *  
     *  Lastly, the PDO statement has no `close()` method.
    */
    include_once "SessionStart.php";
    include_once "GlobalVariables.php";
    
    class Database{
        //  Database Credentials
        private $m_Host;
        private $m_Dbname;
        private $m_Username;
        private $m_Password;

        public $Conn;


        // Read dotenv file
        public function __construct(){
            #   read dotenv info and initialize members!
            /**
             * Using __FILE__ ensures that even if `Database` is included
             * in another file, tha path to only `Database` is used to find the
             * .env file.
             *  Without it, the relatrive paths using "../." would be relative
             * to the file that includes `Database`, causing parse_ini_file
             *  to not be able to find .env for some includes
             */
            $envHandle = parse_ini_file(dirname(__FILE__) . "/../.env");
            $this->m_Host = $envHandle['DBHost'];
            $this->m_Dbname = $envHandle['DBName'];
            $this->m_Username = $envHandle['DBUsername'];
            $this->m_Password = $envHandle['DBPWD'];
        }
        
        //  Get the database connection
        //  Pree the OOP method of connecting to the database
        public function GetConnection(){
            $this->Conn = null;

            try{
                $this->Conn = new PDO("mysql:host=" . $this->m_Host . ";dbname=" . $this->m_Dbname, $this->m_Username, $this->m_Password);
                $this->Conn->exec("set names utf8");
                // echo json_encode([  
                //     'db_status_message'=>"Connected to Database: {Host: $this->m_Host, DbName: $this->m_Dbname, User: $this->m_Username} <br><br>"
                // ]);
                //  whitespace character to separate this from a subsequent 
                // echo value
                // echo ",\n";
            }
            catch(PDOException $exceps){
                echo "Connection Error: " . $exceps->getMessage() ."<br><br>";
            }
            // echo "Pree This!";

            return $this->Conn;
        }

        //  This built-in function is called once script ends.
        
        // public function onShutdown()
        // {
        //     // $this->Conn->close();
        // }

    }
?>