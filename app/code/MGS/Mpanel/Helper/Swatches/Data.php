<?php
/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace MGS\Mpanel\Helper\Swatches;

use Magento\Catalog\Model\Product as ModelProduct;

/**
 * Contact base helper
 */
class Data extends \Magento\Swatches\Helper\Data
{
	/**
     * @param Product $product
     * @param string $imageFile
     * @return array
     */
    protected function getAllSizeImages(ModelProduct $product, $imageFile)
    {
		$largeSize = $this->getImageSizeForDetails();
		$mediumSize = $this->getImageSize();
		$minSize = $this->getImageMinSize();
        return [
            'large' => $this->imageHelper->init($product, 'product_page_image_large')
                ->resize($largeSize['width'],$largeSize['height'])
                ->setImageFile($imageFile)
                ->getUrl(),
            'medium' => $this->imageHelper->init($product, 'product_page_image_medium')
                ->resize($mediumSize['width'],$mediumSize['height'])
                ->setImageFile($imageFile)
                ->getUrl(),
            'small' => $this->imageHelper->init($product, 'product_page_image_small')
				->resize($minSize['width'],$minSize['height'])
                ->setImageFile($imageFile)
                ->getUrl(),
        ];
    }
	
	public function getStoreConfig($node){
		return $this->scopeConfig->getValue($node, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
	}
	
	/* Get product image size */
	public function getImageSize(){
		$ratio = $this->getStoreConfig('mpanel/catalog/picture_ratio');
		$result = [];
        switch ($ratio) {
            // 1/1 Square
            case 1:
                $result = array('width' => 400, 'height' => 400);
                break;
            // 1/2 Portrait
            case 2:
                $result = array('width' => 400, 'height' => 800);
                break;
            // 2/3 Portrait
            case 3:
                $result = array('width' => 400, 'height' => 600);
                break;
            // 3/4 Portrait
            case 4:
                $result = array('width' => 400, 'height' => 533);
                break;
            // 2/1 Landscape
            case 5:
                $result = array('width' => 800, 'height' => 400);
                break;
            // 3/2 Landscape
            case 6:
                $result = array('width' => 400, 'height' => 267);
                break;
            // 4/3 Landscape
            case 7:
                $result = array('width' => 400, 'height' => 300);
                break;
        }

        return $result;
	}
	
	public function getImageSizeForDetails() {
		$ratio = $this->getStoreConfig('mpanel/catalog/picture_ratio');
        $result = [];
        switch ($ratio) {
            // 1/1 Square
            case 1:
                $result = array('width' => 600, 'height' => 600);
                break;
            // 1/2 Portrait
            case 2:
                $result = array('width' => 600, 'height' => 1200);
                break;
            // 2/3 Portrait
            case 3:
                $result = array('width' => 600, 'height' => 900);
                break;
            // 3/4 Portrait
            case 4:
                $result = array('width' => 600, 'height' => 800);
                break;
            // 2/1 Landscape
            case 5:
                $result = array('width' => 600, 'height' => 300);
                break;
            // 3/2 Landscape
            case 6:
                $result = array('width' => 600, 'height' => 400);
                break;
            // 4/3 Landscape
            case 7:
                $result = array('width' => 600, 'height' => 450);
                break;
        }

        return $result;
    }
	
	public function getImageMinSize() {
        $ratio = $this->getStoreConfig('mpanel/catalog/picture_ratio');
        $result = [];
        switch ($ratio) {
            // 1/1 Square
            case 1:
                $result = array('width' => 80, 'height' => 80);
                break;
            // 1/2 Portrait
            case 2:
                $result = array('width' => 80, 'height' => 160);
                break;
            // 2/3 Portrait
            case 3:
                $result = array('width' => 80, 'height' => 120);
                break;
            // 3/4 Portrait
            case 4:
                $result = array('width' => 80, 'height' => 107);
                break;
            // 2/1 Landscape
            case 5:
                $result = array('width' => 80, 'height' => 40);
                break;
            // 3/2 Landscape
            case 6:
                $result = array('width' => 80, 'height' => 53);
                break;
            // 4/3 Landscape
            case 7:
                $result = array('width' => 80, 'height' => 60);
                break;
        }

        return $result;
    }
}