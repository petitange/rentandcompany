<?php

namespace MGS\Social\Controller\Twitter;

use Magento\Framework\App\Action\Action;
use Magento\Customer\Model\Account\Redirect as AccountRedirect;
use Magento\Framework\App\Action\Context;
use Magento\Customer\Model\Session;
use Magento\Customer\Api\AccountManagementInterface;
use Magento\Customer\Model\Url as CustomerUrl;
use Magento\Store\Model\StoreManagerInterface;
use MGS\Social\Helper\Data as SocialHelper;

require_once BP . '/app/code/MGS/Social/lib/twitter/twitteroauth.php';

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
        if (!$this->socialHelper->getConfig('general_settings/active')) {
            $this->messageManager->addError(__('Social login has been disabled.'));
            $this->redirectPage($this->customerUrl->getLoginUrl());
        }
        if (!$this->socialHelper->getConfig('twitter_settings/active')) {
            $this->messageManager->addError(__('Twitter login has been disabled.'));
            $this->redirectPage($this->customerUrl->getLoginUrl());
        }
        try {
            $clientId = $this->socialHelper->getConfig('twitter_settings/client_id');
            $clientSecret = $this->socialHelper->getConfig('twitter_settings/client_secret');
            $params = $this->getRequest()->getParams();
            if (isset($params['denied'])) {
                echo '<script type="text/javascript">window.close();</script>';
                exit;
            }
            if (isset($params['oauth_token']) && $_SESSION['oauth_token'] == $params['oauth_token']) {
                $storeId = $this->storeManager->getStore()->getId();
                $websiteId = $this->storeManager->getStore($storeId)->getWebsiteId();
                $connection = new \TwitterOAuth($clientId, $clientSecret, $_SESSION['oauth_token'], $_SESSION['oauth_token_secret']);
                $accessToken = $connection->getAccessToken($params['oauth_verifier']);
                unset($_SESSION['oauth_token']);
                unset($_SESSION['oauth_token_secret']);
                $content = $connection->get('account/verify_credentials');
                $data = array();
                if (!empty($content->id)) {
                    $data['id'] = $content->id;
                    $data['name'] = $content->name;
                    $data['screen_name'] = $content->screen_name;
                    $data['email'] = $content->screen_name . '@twitter.com';
                    $customersByTwitterId = $this->socialHelper->getCustomersByTwitterId($data['id'], $websiteId);
                    if ($this->socialHelper->checkLoggedIn()) {
                        if ($customersByTwitterId->getSize()) {
                            $this->messageManager->addSuccess(__('Your twitter account is already connected to one of our store accounts.'));
                            $this->redirectPage($this->customerUrl->getAccountUrl());
                        }
                        $customer = $this->_objectManager->get('Magento\Customer\Model\Session')->getCustomer();
                        $this->socialHelper->connectByTwitterId($customer, $data['id'], $accessToken);
                        $this->messageManager->addSuccess(__('Your twitter account is now connected to your store account. You can now login using our twitter login button or using store account credentials you will receive to your email address.'));
                        $this->redirectPage($this->customerUrl->getAccountUrl());
                    }
                    if ($customersByTwitterId->getSize()) {
                        $customer = $customersByTwitterId->getFirstItem();
                        $this->socialHelper->loginByCustomer($customer);
                        $this->messageManager->addSuccess(__('You have successfully logged in using your twitter account.'));
                        $this->redirectPage($this->customerUrl->getAccountUrl());
                    }
                    $customersByEmail = $this->socialHelper->getCustomersByEmail($data['email'], $websiteId);
                    if ($customersByEmail->getSize()) {
                        $customer = $customersByEmail->getFirstItem();
                        $this->socialHelper->connectByTwitterId($customer, $data['id'], $accessToken);
                        $this->messageManager->addSuccess(__('We have discovered you already have an account at our store. Your twitter account is now connected to your store account.'));
                        $this->redirectPage($this->customerUrl->getAccountUrl());
                    }
                    $name = $data['name'];
                    if (empty($name)) {
                        $this->messageManager->addError(__('Sorry, could not retrieve your twitter name. Please try again!'));
                        $this->redirectPage($this->customerUrl->getLoginUrl());
                    }
                    $screenName = $data['screen_name'];
                    if (empty($screenName)) {
                        $this->messageManager->addError(__('Sorry, could not retrieve your twitter screen name. Please try again!'));
                        $this->redirectPage($this->customerUrl->getLoginUrl());
                    }
                    $this->socialHelper->createAccountAndLogin($data['email'], $data['screen_name'], $data['screen_name'], $data['id'], $accessToken, 'twitter', $websiteId);
                    $this->messageManager->addSuccess(__('Your twitter account is now connected to your new user account at our store. Now you can login using our twitter login button or using store account credentials you will receive to your email address.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                } else {
                    $this->messageManager->addError(__('Sorry, could not login. Please try again!'));
                    $this->redirectPage($this->customerUrl->getLoginUrl());
                }
            }
        } catch (\Exception $e) {
            $this->messageManager->addError(__('Sorry, could not login. Please try again!'));
        }
        $this->redirectPage($this->customerUrl->getAccountUrl());
    }

    public function redirectPage($url)
    {
        echo "<script type='text/javascript'>window.opener.location.href='" . $url . "';window.close();</script>";
        exit;
    }
}