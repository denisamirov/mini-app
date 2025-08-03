// Импортируем универсальную функцию getUserData и функции прелоадера
import { getUserData, waitForTelegram, showPreloader, hidePreloader, waitForTelegramReady, setPreloaderText } from '../telegram.js';

// Функция для создания HTML кнопки с количеством
const getQuantityInputHTML = (btnProductId, count = 1) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="${count}" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`

// Функция для обновления localStorage
const updateProductsFromStorage = async (id, isAdd) => {
    const user = await getUserData();
    const productListString = localStorage.getItem(user.id)
    const productList = productListString ? JSON.parse(productListString) : []
    const product = productList.find(product => product.id == id)

    if (!product) {
        productList.push({ id, count: 1 })
        console.log('Product page: Adding new product with count 1')
    }
    else if (isAdd) {
        product.count += 1
        console.log('Product page: Increasing product count to:', product.count)
    }
    else if (!isAdd) {
        product.count -= 1
        console.log('Product page: Decreasing product count to:', product.count)
        // Удаляем товар из корзины, если количество стало 0
        if (product.count <= 0) {
            const index = productList.findIndex(p => p.id == id);
            if (index > -1) {
                productList.splice(index, 1);
                console.log('Product page: Removing product from cart (count <= 0)')
            }
        }
    }

    localStorage.setItem(user.id, JSON.stringify(productList));
    console.log('Product page: Updated localStorage:', user.id, localStorage.getItem(user.id))
}

// Функция для инициализации кнопок количества
const initializeQuantityControls = (btnProductId) => {
    const productContainer = document.querySelector(`[btn_product_id="${btnProductId}"]`);
    if (!productContainer) return;
    
    const increaseBtn = productContainer.querySelector('.increase');
    const decreaseBtn = productContainer.querySelector('.decrease');
    
    if (increaseBtn) {
        increaseBtn.removeEventListener('click', increaseBtn.increaseHandler);
        increaseBtn.increaseHandler = function () {
            let quantityInput = this.parentElement.querySelector(`[btn_product_id="${btnProductId}"]`);
            if (!quantityInput) return;
            quantityInput.value = parseInt(quantityInput.value) + 1;
            updateProductsFromStorage(btnProductId, true);
        };
        increaseBtn.addEventListener('click', increaseBtn.increaseHandler);
    }

    if (decreaseBtn) {
        decreaseBtn.removeEventListener('click', decreaseBtn.decreaseHandler);
        decreaseBtn.decreaseHandler = function () {
            let quantityInput = this.parentElement.querySelector(`[btn_product_id="${btnProductId}"]`);
            console.log('Product page: Decrease button clicked, current value:', quantityInput?.value);
            
            if (quantityInput && parseInt(quantityInput.value) >= 1) {
                const newValue = parseInt(quantityInput.value) - 1;
                quantityInput.value = newValue;
                console.log('Product page: Decreasing quantity to:', newValue);
                updateProductsFromStorage(btnProductId, false);
                
                // Если количество стало 0, заменяем на кнопку "Добавить"
                if (newValue <= 0) {
                    console.log('Product page: Quantity is 0, creating add button');
                    setTimeout(() => {
                        createAndReplaceButton(btnProductId);
                    }, 100);
                }
            } else {
                console.log('Product page: Cannot decrease: quantity is already 0 or input not found');
            }
        };
        decreaseBtn.addEventListener('click', decreaseBtn.decreaseHandler);
    }
}

// Функция для создания кнопки "Добавить"
const createAndReplaceButton = (btnProductId) => {
    console.log('Product page: Creating add button for product:', btnProductId)
    const btn = document.createElement('button')
    btn.setAttribute('btn_product_id', btnProductId)
    btn.classList.add('buy-button')
    btn.textContent = 'Добавить'

    const container = document.querySelector(`[btn_product_id="${btnProductId}"]`)
    if (container) {
        container.innerHTML = ''
        container.appendChild(btn)
        console.log('Product page: Add button created successfully')
        
        // Добавляем обработчик для новой кнопки
        btn.addEventListener('click', async (e) => {
            e.stopPropagation() // Предотвращаем всплытие события
            console.log('Product page: Add button clicked, adding product')
            await updateProductsFromStorage(btnProductId, true)
            container.innerHTML = getQuantityInputHTML(btnProductId)
            initializeQuantityControls(btnProductId)
        })
    } else {
        console.log('Product page: Container not found for product:', btnProductId)
    }
}

// Основная логика загрузки продукта
showPreloader();

const response = await fetch('../goods.json')

if (!response.ok) throw new Error('Ошибка загрузки товаров')

const goods = await response.json()

const urlParams = new URLSearchParams(window.location.search)
const productId = urlParams.get('id')

const product = goods.find((product) => product.id == productId)

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
    
    // Ждем инициализации Telegram и затем проверяем корзину
    const initializeProductPage = async () => {
        // Ждем инициализации Telegram
        const user = await getUserData();
        console.log('Product page: User initialized:', user);
        
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
    
    // Показываем прелоадер сразу при загрузке
    
    // Ждем инициализации Telegram и затем проверяем корзину
    waitForTelegram(async () => {
        try {
            // Ждем полной инициализации Telegram WebApp
            await waitForTelegramReady();
            
            // Запускаем инициализацию
            await initializeProductPage();
            
            // Скрываем прелоадер
            hidePreloader();
            
            console.log('Product page: Application fully loaded');
        } catch (error) {
            console.error('Error loading product page:', error);
            hidePreloader();
        }
    });
}