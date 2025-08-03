// Импортируем универсальную функцию getUserData и функции прелоадера
import { getUserData, waitForTelegram, showPreloader, hidePreloader, waitForTelegramReady, setPreloaderText } from '../telegram.js';

// Импортируем функции из buy-button модуля
import { 
    getQuantityInputHTML, 
    updateProductsFromStorage, 
    initializeQuantityControls, 
    createAndReplaceButton 
} from '../buy-button/buy-button.js';

// Основная логика загрузки продукта
showPreloader();

waitForTelegram(async () => {
    try {
        await waitForTelegramReady();
        await renderProduct();
        await initializeProductPage();
        hidePreloader();
    } catch (error) {
        console.error('Error loading product page:', error);
        hidePreloader();
    }
});

const renderProduct = async () => {
    const response = await fetch('../goods.json')

    if (!response.ok) throw new Error('Ошибка загрузки товаров')

    const goods = await response.json()

    const urlParams = new URLSearchParams(window.location.search)
    const productId = urlParams.get('id')

    const product = goods.find((product) => product.id == productId)

    const productHTML = `
    <img src="" alt="картинка" class="product-card__image">
        <div class="product-card__info">
            <h1 class="product-card__title"></h1>
            <p class="product-card__description"></p>
            <p class="product-card__amount-text">Осталось:
                <span class="product-card__amount"></span>
            </p>
        </div>
        <div class="product-card__actions">
            <p class="product-card__price"></p>
            <div class="product-buy-button">
                <button class="buy-button">Добавить</button>
            </div>
        </div>
    `

    document.querySelector('.product-card').innerHTML = productHTML

    if (!product) {
        document.querySelector('.product-card').innerHTML = 'Товар не найден'
    }
    else {
        document.querySelector('.product-card__title').textContent = product.name
        document.querySelector('.product-card__description').textContent = product.description
        document.querySelector('.product-card__price').textContent = product.price
        document.querySelector('.product-card__image').src = product.image_url
        document.querySelector('.product-card__amount').textContent = product.amount
        document.querySelector('.product-buy-button').setAttribute("btn_product_id", product.id)

    }
}

// Ждем инициализации Telegram и затем проверяем корзину
const initializeProductPage = async () => {
    // Ждем инициализации Telegram
    const user = await getUserData();
    console.log('Product page: User initialized:', user);

    const productId = new URLSearchParams(window.location.search).get('id')

    const productListString = localStorage.getItem(user.id);
    console.log('Product page: localStorage for user', user.id, ':', productListString);

    if (productListString) {
        try {
            const productList = JSON.parse(productListString);
            const cartProduct = productList.find(item => item.id == productId);

            if (cartProduct && cartProduct.count > 0) {
                // Показываем кнопки с количеством
                document.querySelector('.product-buy-button').innerHTML = getQuantityInputHTML(productId, cartProduct.count);
                initializeQuantityControls(productId);
            }
        } catch (e) {
            console.log('Error parsing cart data:', e);
        }
    }

    // Добавляем обработчик для кнопки
    const buyButton = document.querySelector('.product-buy-button');
    buyButton.addEventListener('click', async () => {
        if (buyButton.querySelector('.buy-button')) {
            await updateProductsFromStorage(productId, true);
            buyButton.innerHTML = getQuantityInputHTML(productId);
            initializeQuantityControls(productId);
        }
        else {
            const input = document.querySelector(`input[btn_product_id="${productId}"]`);
            if (input && parseInt(input.value) <= 0) {
                createAndReplaceButton(productId);
            } else {
                initializeQuantityControls(productId);
            }
        }
    });
};