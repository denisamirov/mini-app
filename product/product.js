// Функция для получения ID пользователя с ожиданием Telegram
const getUserData = async () => {
    // Ждем инициализации Telegram WebApp
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        try {
            // Ждем готовности Telegram WebApp
            await new Promise((resolve) => {
                if (Telegram.WebApp.isExpanded !== undefined) {
                    resolve();
                } else {
                    Telegram.WebApp.ready();
                    setTimeout(resolve, 100);
                }
            });
            
            if (Telegram.WebApp.initData) {
                const initData = Telegram.WebApp.initData
                const params = new URLSearchParams(initData)
                const userData = params.get('user');
                return userData ? JSON.parse(userData) : { id: 215430 };
            }
        } catch (error) {
            console.log('Telegram WebApp error:', error);
        }
    }
    
    // Fallback для обычного браузера или ошибки
    return { id: 215430 };
}

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
    }
    else if (isAdd) {
        product.count += 1
    }
    else if (!isAdd) {
        product.count -= 1
    }

    localStorage.setItem(user.id, JSON.stringify(productList));
    console.log(user.id, localStorage.getItem(user.id))
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
            if (quantityInput && quantityInput.value >= 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
                updateProductsFromStorage(btnProductId, false);
            }
        };
        decreaseBtn.addEventListener('click', decreaseBtn.decreaseHandler);
    }
}

// Функция для создания кнопки "Добавить"
const createAndReplaceButton = (btnProductId) => {
    const btn = document.createElement('button')
    btn.setAttribute('btn_product_id', btnProductId)
    btn.classList.add('buy-button')
    btn.textContent = 'Добавить'

    document.querySelector(`[btn_product_id="${btnProductId}"]`)
        .querySelector('.input-group')
        .replaceWith(btn)
}

// Основная логика загрузки продукта
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
    
    // Проверяем, есть ли товар в корзине
    const user = await getUserData();
    const productListString = localStorage.getItem(user.id);
    
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
    buyButton.addEventListener('click', () => {
        if (buyButton.querySelector('.buy-button')) {
            updateProductsFromStorage(productId, true);
            buyButton.innerHTML = getQuantityInputHTML(productId);
            initializeQuantityControls(productId);
        }
        else {
            const input = document.querySelector(`input[btn_product_id="${productId}"]`);
            if (input && input.value == 0) {
                createAndReplaceButton(productId);
            } else {
                initializeQuantityControls(productId);
            }
        }
    });
}