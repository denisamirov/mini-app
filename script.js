import { getUserData, waitForTelegram, showPreloader, hidePreloader, waitForTelegramReady, setPreloaderText } from './telegram.js';

import { getQuantityInputHTML } from './buy-button/buy-button.js';
import { render } from './utils/render.js';

const container = document.querySelector('.card-list')

container.innerHTML = ''

const productTemplate = async (product) => {
    const user = await getUserData();
    const userData = localStorage.getItem(user.id);
    let buttonHTML = `<button class="buy-button">Добавить</button>`;

    if (userData) {
        try {
            const products = JSON.parse(userData);
            const p = products.find(item => item.id === product.id);
            if (p && p.count > 0) {
                buttonHTML = getQuantityInputHTML(p.id, p.count);
            }
        } catch (e) {
            console.log('Error parsing user data:', e);
        }
    }

    return `
        <div class="card">
            <a href="./product/product.html?id=${product.id}">
                <img class="card-img" src="${product.image_url}" alt="картинка">
            </a>
            <div class="card-content">
                <div class="card-content-description">
                    <h2 class="card-price">${product.price}</h2>
                    <p class="card-title">${product.name}</p>
                </div>
                <div class="product-buy-button" btn_product_id=${product.id}>
                    ${buttonHTML}
                </div>
            </div>
        </div>
    `;
}

const response = await fetch('./goods.json')

if (!response.ok) throw new Error('Ошибка загрузки товаров')

const goods = await response.json()

const loadProducts = async () => {
    await render({
        source: goods,
        container,
        template: async (product) => await productTemplate(product),
    })

    // Инициализируем контролы покупки после вставки
    const { initializeBuyButtons } = await import('./buy-button/buy-button.js');
    initializeBuyButtons();
    console.log('Main page: Products loaded successfully');
};

// Показываем прелоадер сразу при загрузке
showPreloader();
setPreloaderText('Загрузка приложения...', 'Пожалуйста, подождите');

// Ждем полной готовности Telegram WebApp
waitForTelegram(async () => {
    try {
        // Дополнительно ждем полной инициализации
        await waitForTelegramReady();
        
        document.querySelector('.title').innerHTML = 'Товары нашего магазина'
        // Загружаем товары
        await loadProducts();
        
        // Скрываем прелоадер
        hidePreloader();
        
        console.log('Main page: Application fully loaded');
    } catch (error) {
        console.error('Error loading application:', error);
        hidePreloader();
    }
});