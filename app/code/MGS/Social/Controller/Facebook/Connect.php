<?php

namespace MGS\Social\Controller\Facebook;

use Magento\Framework\App\Action\Action;
use Magento\Customer\Model\Account\Redirect as AccountRedirect;
use Magento\Framework\App\Action\Context;
use Magento\Customer\Model\Session;
use Magento\Customer\Api\AccountManagementInterface;
use Magento\Customer\Model\Url as CustomerUrl;
use Magento\Store\Model\StoreManagerInterface;
use MGS\Social\Helper\Data as SocialHelper;

require_once BP . '/app/code/MGS/Social/lib/facebook/src/facebook.php';

class Connect extends Action
{
    protected $customerAccountManagement;
    protected $accountRedirect;
    protected $session;
    protected $storeManager;
    protected $socialHelper;

    public function __construct(
        Context $context,
        Session $customerSession,
        AccountManagementInterface $customerAccountManagement,
        CustomerUrl $customerHelperData,
        AccountRedirect $accountRedirect,
        StoreManagerInterface $storeManager,
        SocialHelper $socialHelper
    )
    {
        $this->session = $customerSession;
        $this->customerAccountManagement = $customerAccountManagement;
        $this->customerUrl = $customerHelperData;
        $this->accountRedirect = $accountRedirect;
        $this->storeManager = $storeManager;
        $this->socialHelper = $socialHelper;
        parent::__construct($context);
    }

    public function execute()
    {
        $params = $this->_request->getParams();
        if (isset($params['error'])) {
            echo '<script type="text/javascript">window.close();</script>';
            exit;
        }
        if (!$this->socialHelper->getConfig('general_settings/active')) {
            $this->messageManager->addError(__('Social login has been disabled.'));
            $this->redirectPage($this->customerUrl->getLoginUrl());
        }
        if (!$this->socialHelper->getConfig('facebook_settings/active')) {
            $this->messageManager->addError(__('Facebook login has been disabled.'));
            $this->redirectPage($this->customerUrl->getLoginUrl());
        }
        try {
            $facebook = new \Facebook(array(
                'appId' => $this->socialHelper->getConfig('facebook_settings/client_id'),
                'secret' => $this->socialHelper->getConfig('facebook_settings/client_secret'),
            ));
            $fid = $facebook->getUser();
            $ftoken = $facebook->getAccessToken();
            if ($fid) {
                $storeId = $this->storeManager->getStore()->getId();
                $websiteId = $this->storeManager->getStore($storeId)->getWebsiteId();
                $data = $facebook->api('/me?fields=id,first_name,last_name,email,gender,locale,picture');
                $customersByFacebookId = $this->socialHelper->getCustomersByFacebookId($fid, $websiteId);
                if ($this->_objectManager->get('Magento\Customer\Model\Session')->isLoggedIn()) {
                    if ($customersByFacebookId->getSize()) {
                        $this->messageManager->addNotice(__('Your facebook account is already connected to one of our store accounts.'));
                    }
                    $customer = $this->_objectManager->get('Magento\Customer\Model\Session')->getCustomer();
                    $this->socialHelper->connectByFacebookId($customer, $fid, $ftoken);
                    $this->messageManager->addSuccess(__('Your facebook account is now connected to your store account. You can now login using our facebook login button or using store account credentials you will receive to your email address.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                }
                if ($customersByFacebookId->getSize()) {
                    $customer = $customersByFacebookId->getFirstItem();
                    $this->socialHelper->loginByCustomer($customer);
                    $this->messageManager->addSuccess(__('You have successfully logged in using your facebook account.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                }
                $customersByEmail = $this->socialHelper->getCustomersByEmail($data['email'], $websiteId);
                if ($customersByEmail->getSize()) {
                    $customer = $customersByEmail->getFirstItem();
                    $this->socialHelper->connectByFacebookId($customer, $fid, $ftoken);
                    $this->messageManager->addSuccess(__('We have discovered you already have an account at our store. Your facebook account is now connected to your store account.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                }
                $firstName = $data['first_name'];
                if (empty($firstName)) {
                    $this->messageManager->addError(__('Sorry, could not retrieve your facebook first name. Please try again!'));
                    $this->redirectPage($this->customerUrl->getLoginUrl());
                }
                $lastName = $data['last_name'];
                if (empty($lastName)) {
                    $this->messageManager->addError(__('Sorry, could not retrieve your facebook last name. Please try again!'));
                    $this->redirectPage($this->customerUrl->getLoginUrl());
                }
                $this->socialHelper->createAccountAndLogin($data['email'], $data['first_name'], $data['last_name'], $fid, $ftoken, 'facebook', $websiteId);
                $this->messageManager->addSuccess(__('Your facebook account is now connected to your new user account at our store. Now you can login using our facebook login button or using store account credentials you will receive to your email address.'));
                $this->redirectPage($this->customerUrl->getAccountUrl());
            }
        } catch (\Exception $e) {
            $this->messageManager->addError(__('Sorry, could not login. Please try again!'));
            $this->redirectPage($this->customerUrl->getLoginUrl());
        }
        $this->redirectPage($this->customerUrl->getAccountUrl());
    }

    public function redirectPage($url)
    {
        echo "<script type='text/javascript'>window.opener.location.href='" . $url . "';window.close();</script>";
        exit;
    }
}