<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Magento\Wishlist\Test\Constraint;

use Magento\Wishlist\Test\Page\WishlistIndex;
use Magento\Mtf\Constraint\AbstractConstraint;
use Magento\Mtf\Fixture\InjectableFixture;

/**
 * Class AssertAddProductToWishlistSuccessMessage
 * Assert that success message appears on My Wish List page after adding product to wishlist.
 */
class AssertAddProductToWishlistSuccessMessage extends AbstractConstraint
{
    /* tags */
    const SEVERITY = 'low';
    /* end tags */

    /**
     * Success add message
     */
    const SUCCESS_MESSAGE = "%s ha sido agregado a tu Wish List. Click aquí para seguir cotizando.";

    /**
     * Assert that success message appears on My Wish List page after adding product to wishlist.
     *
     * @param WishlistIndex $wishlistIndex
     * @param InjectableFixture $product
     * @return void
     */
    public function processAssert(WishlistIndex $wishlistIndex, InjectableFixture $product)
    {
        \PHPUnit_Framework_Assert::assertEquals(
            sprintf(self::SUCCESS_MESSAGE, $product->getName()),
            $wishlistIndex->getMessagesBlock()->getSuccessMessage(),
            "El mensaje de éxito esperado no coincide con el real."
        );
    }

    /**
     * Returns a string representation of the object
     *
     * @return string
     */
    public function toString()
    {
        return 'El mensaje de éxito aparece en la página Wish List después de agregar un producto a la Wish List.';
    }
}
