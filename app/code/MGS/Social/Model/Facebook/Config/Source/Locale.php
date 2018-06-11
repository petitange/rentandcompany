<?php

namespace MGS\Social\Model\Facebook\Config\Source;

use Magento\Framework\Convert\Xml;
use Magento\Framework\Option\ArrayInterface;

class Locale implements ArrayInterface
{
    public function toOptionArray()
    {
        $options = [];
        try {
            $file = BP . '/lib/internal/MGS/Social/facebook/FacebookLocales.xml';
            $xml = simplexml_load_string(file_get_contents($file));
            $json = json_encode($xml);
            $array = json_decode($json, true);
            $locales = $array['locale'];
            foreach ($locales as $locale) {
                $options[] = [
                    'value' => $locale['codes']['code']['standard']['representation'],
                    'label' => __($locale['englishName'])
                ];
            }
        } catch (\Exception $e) {

        }
        return $options;
    }

}
