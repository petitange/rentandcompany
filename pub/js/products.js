

window.products = {};
async function getProducts() {
    var ajaxurl = 'http://rent.test/pedido?getProducts=14,10'
    
    const result = await jQuery.ajax({
        url: ajaxurl,
        type: 'GET'
    });

    console.log({result})
    var products = JSON.parse(result);
    window.products = products.data
}

getProducts();
