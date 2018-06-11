<?php

namespace MGS\Social\Controller\Google;

use Magento\Framework\App\Action\Action;
use Magento\Customer\Model\Account\Redirect as AccountRedirect;
use Magento\Framework\App\Action\Context;
use Magento\Customer\Model\Session;
use Magento\Customer\Api\AccountManagementInterface;
use Magento\Customer\Model\Url as CustomerUrl;
use Magento\Store\Model\StoreManagerInterface;
use MGS\Social\Helper\Data as SocialHelper;

require_once BP . '/app/code/MGS/Social/lib/google/Google_Client.php';
require_once BP . '/app/code/MGS/Social/lib/google/Google_Oauth2Service.php';

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
        if (!$this->socialHelper->getConfig('google_settings/active')) {
            $this->messageManager->addError(__('Google login has been disabled.'));
            $this->redirectPage($this->customerUrl->getLoginUrl());
        }
        try {
            $params = $this->getRequest()->getParams();
            $clientId = $this->socialHelper->getConfig('google_settings/client_id');
            $clientSecret = $this->socialHelper->getConfig('google_settings/client_secret');
            $redirectUri = $this->socialHelper->getUrl('social/google/connect');
            $client = new \Google_Client();
            $client->setApprovalPrompt('auto');
            $client->setAccessType('offline');
            $client->setClientId($clientId);
            $client->setClientSecret($clientSecret);
            $client->setRedirectUri($redirectUri);
            $client->setScopes(array(
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ));
            if (isset($params['error'])) {
                echo '<script type="text/javascript">window.close();</script>';
                exit;
            }
            $oauth2 = new \Google_Oauth2Service($client);
            if (isset($params['code'])) {
                $client->authenticate($params['code']);
                $gtoken = $client->getAccessToken();
                $client->setAccessToken($gtoken);
            }
            if ($client->getAccessToken()) {
                $storeId = $this->storeManager->getStore()->getId();
                $websiteId = $this->storeManager->getStore($storeId)->getWebsiteId();
                $data = $oauth2->userinfo->get();
                $customersByGoogleId = $this->socialHelper->getCustomersByGoogleId($data['id'], $websiteId);
                if ($this->socialHelper->checkLoggedIn()) {
                    if ($customersByGoogleId->getSize()) {
                        $this->messageManager->addSuccess(__('Your google account is already connected to one of our store accounts.'));
                        $this->redirectPage($this->customerUrl->getAccountUrl());
                    }
                    $customer = $this->_objectManager->get('Magento\Customer\Model\Session')->getCustomer();
                    $this->socialHelper->connectByGoogleId($customer, $data['id'], $client->getAccessToken());
                    $this->messageManager->addSuccess(__('Your google account is now connected to your store account. You can now login using our google login button or using store account credentials you will receive to your email address.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                }
                if ($customersByGoogleId->getSize()) {
                    $customer = $customersByGoogleId->getFirstItem();
                    $this->socialHelper->loginByCustomer($customer);
                    $this->messageManager->addSuccess(__('You have successfully logged in using your google account.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                }
                $customersByEmail = $this->socialHelper->getCustomersByEmail($data['email'], $websiteId);
                if ($customersByEmail->getSize()) {
                    $customer = $customersByEmail->getFirstItem();
                    $this->socialHelper->connectByGoogleId($customer, $data['id'], $client->getAccessToken());
                    $this->messageManager->addSuccess(__('We have discovered you already have an account at our store. Your google account is now connected to your store account.'));
                    $this->redirectPage($this->customerUrl->getAccountUrl());
                }
                $firstName = $data['given_name'];
                if (empty($firstName)) {
                    $this->messageManager->addError(__('Sorry, could not retrieve your google first name. Please try again!'));
                    $this->redirectPage($this->customerUrl->getLoginUrl());
                }
                $lastName = $data['family_name'];
                if (empty($lastName)) {
                    $this->messageManager->addError(__('Sorry, could not retrieve your google last name. Please try again!'));
                    $this->redirectPage($this->customerUrl->getLoginUrl());
                }
                $this->socialHelper->createAccountAndLogin($data['email'], $data['given_name'], $data['family_name'], $data['id'], $client->getAccessToken(), 'google', $websiteId);
                $this->messageManager->addSuccess(__('Your google account is now connected to your new user account at our store. Now you can login using our google login button or using store account credentials you will receive to your email address.'));
                $this->redirectPage($this->customerUrl->getAccountUrl());
            } else {
                $this->messageManager->addError(__('Sorry, could not login. Please try again!'));
                $this->redirectPage($this->customerUrl->getLoginUrl());
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