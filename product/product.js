const response = await fetch('../goods.json');

if (!response.ok) throw new Error('Ошибка загрузки товаров');

const goods = await response.json()

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

const product = goods.find((product) => product.id == productId)

if (!product) {
    document.querySelector('.product-card').innerHTML = 'Товар не найден'
}
else {
    document.querySelector('.product-card__title').textContent = product.name;
    document.querySelector('.product-card__description').textContent = product.description;
    document.querySelector('.product-card__price').textContent = product.price;
    document.querySelector('.product-card__image').src = product.image_url;
    document.querySelector('.product-card__amount').textContent = product.amount;
}