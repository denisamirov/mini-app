// Импортируем универсальную функцию getUserData
import { getUserData } from './shared/user.js';

export const getQuantityInputHTML = (btnProductId, count) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="${count}" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`


const container = document.querySelector('.card-list')

container.innerHTML = ''

const productTemplate = async (product) => {
    const user = await getUserData();
    const userData = localStorage.getItem(user.id);
    console.log(user, userData, 'Подгрузка из локального хранилища')
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

// Асинхронная функция для загрузки товаров
const loadProducts = async () => {
    // Ждем инициализации Telegram перед загрузкой товаров
    console.log('Main page: Starting product loading...');
    
    for (const product of goods) {
        const template = await productTemplate(product);
        container.insertAdjacentHTML('beforeend', template);
    }
    
    // Загружаем buy-button.js после загрузки товаров
    const { initializeBuyButtons } = await import('./buy-button/buy-button.js');
    initializeBuyButtons();
    console.log('Main page: Products loaded successfully');
};

// Запускаем загрузку товаров
await loadProducts().catch(error => {
    console.error('Error loading products:', error);
});
