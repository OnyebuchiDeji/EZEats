<?php
    /**
     *  Defines the product data structure
     *  It is initialized with product info and sanitizes it.
     */

     class Product
     {
        private $m_info;

        public function __construct($info){
            foreach ($this->m_info as $k=>$v){
                $this->m_info[$k] = htmlentities(strip_tags(trim($v)));
            }
        }

        public function GetInfo()
        {
            return $this->m_info;
        }
     }