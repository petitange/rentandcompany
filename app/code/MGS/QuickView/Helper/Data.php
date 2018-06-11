<?php

namespace MGS\QuickView\Helper;

class Data extends \Magento\Framework\App\Helper\AbstractHelper {

    const XML_PATH_QUICKVIEW_ENABLED = 'mgs_quickview/general/enabled';
    const XML_PATH_QUICKVIEW_BUTTONSTYLE = 'mgs_quickview/general/button_style';

    protected $_url;
    protected $_scopeConfig;

    public function __construct(
		\Magento\Framework\App\Helper\Context $context, 
		\Magento\Framework\Url $url
    ) {
        parent::__construct($context);
        $this->_url = $url;
        $this->_scopeConfig = $context->getScopeConfig();;
    }

    public function aroundQuickViewHtml(
    \Magento\Catalog\Model\Product $product
    ) {
        $result = '';
        $isEnabled = $this->_scopeConfig->getValue(self::XML_PATH_QUICKVIEW_ENABLED, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
        if ($isEnabled) {
            $buttonStyle = 'mgs_quickview_button_' . $this->_scopeConfig->getValue(self::XML_PATH_QUICKVIEW_BUTTONSTYLE, \Magento\Store\Model\ScopeInterface::SCOPE_STORE);
            $productUrl = $this->_url->getUrl('mgs_quickview/catalog_product/view', array('id' => $product->getId()));
            return $result . '<button class="mgs-quickview ' . $buttonStyle . '" data-quickview-url=' . $productUrl . ' title="' . __("Quick View") . '"><span class="fa fa-search"></span></button>';
        }
        return $result;
    }

}
