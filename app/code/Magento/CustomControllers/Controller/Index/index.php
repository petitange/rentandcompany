<?php

namespace Magento\CustomControllers\Controller\Index;
use Magento\Catalog\Model\Product;

class Index extends \Magento\Framework\App\Action\Action
{
/**
* say hello text
*/


public function execute()
{
    $params = $this->getRequest()->getParams();
   
    if(isset($params['products'])) {
       // RM: Products are exploded by ","
        $products = explode(",", $params['products']);
        $product_ids = array();
        foreach($products as $product) {
            // For quantity, we want =
            $p = explode("=", $product);
            //p[0] = SKU article; p[1] = qty

            $product = $this->_objectManager->create(\Magento\Catalog\Model\Product::class);

            $id = $product->getIdBySku($p[0]);
            if ($id != ""){
                $product_ids[$id] = $p[1];
            }
        }
        
       // RM: Add new products - single
        $extra_msg = "";
     
          $cart = $this->_objectManager->create(\Magento\Checkout\Model\Cart::class);
            //$cart = Mage::getModel('checkout/cart');
           foreach($product_ids as $prod_id=>$prod_qty) {
                $storeId = $this->_objectManager->get(
                    \Magento\Store\Model\StoreManagerInterface::class
                )->getStore()->getId();
                $product = $this->_objectManager->create(\Magento\Catalog\Model\Product::class);
                $_product = $product->setStoreId($storeId)->load($prod_id);
                // RM: Can this product be added to cart?
                if($_product->getHasOptions() == 0 && $_product->isSalable() == 1) {
                   $cart->addProduct($_product, array('qty'=>$prod_qty));
                    $cart->save();
                 /*   // RM: Very important
                    Mage::dispatchEvent('checkout_cart_add_product', array('product'=>$product));
                    Mage::getSingleton('checkout/session')->setCartWasUpdated(true);
                    Mage::dispatchEvent('checkout_cart_save_before', array('event'=>$this));
                */
                
                } else {
                    $extra_msg .= '
                    '.$_product->getName().'
                    
                    ';
                }
            }   
        
            header("Location: /checkout/cart");
                die();

    }
}
}