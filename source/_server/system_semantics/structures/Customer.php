<?php
    /**
     *  Defines the customer data structure
     *  It is initialized with customer data and sanitizes that data.
     * 
     * 
     */

     class Customer
     {
        private $m_info;


        public function __construct($info){
            $this->m_info = [];
            foreach ($info as $k=>$v){
                $this->m_info[$k] = htmlentities(strip_tags(trim($v)));
            }
        }

        public function GetInfo()
        {
            return $this->m_info;
        }
     }
