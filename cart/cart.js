// Импортируем универсальную функцию getUserData и функции прелоадера
import { getUserData, waitForTelegram, showPreloader, hidePreloader, waitForTelegramReady, setPreloaderText } from '../telegram.js';

// Функция для получения товаров из localStorage
const getCartItems = async () => {
    console.log('Cart: Getting user data...')
    const user = await getUserData()
    console.log('Cart: User ID:', user.id)

    // Дополнительная проверка для Telegram Mini App
    const telegramExists = typeof Telegram !== 'undefined' && Telegram && Telegram.WebApp;
    if (telegramExists && user.id === 215430) {
        console.log('Cart: Telegram Mini App detected but using fallback user ID, waiting...')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Попробуем получить пользователя еще раз
        const retryUser = await getUserData()
        console.log('Cart: Retry User ID:', retryUser.id)

        if (retryUser.id !== 215430) {
            console.log('Cart: Successfully got real user ID on retry')
            user.id = retryUser.id
        }
    }

    const productListString = localStorage.getItem(user.id)
    console.log('Cart: localStorage data for user', user.id, ':', productListString)

    if (!productListString) {
        console.log('Cart: No data in localStorage')
        return []
    }

    try {
        const items = JSON.parse(productListString)
        console.log('Cart: Parsed items:', items)
        return items
    } catch (e) {
        console.log('Error parsing cart items:', e)
        return []
    }
}

// Функция для получения информации о товаре по ID
const getProductInfo = async (productId) => {
    try {
        const response = await fetch('../goods.json')
        if (!response.ok) throw new Error('Ошибка загрузки товаров')

        const goods = await response.json()
        return goods.find(product => product.id == productId)
    } catch (error) {
        console.error('Ошибка получения информации о товаре:', error)
        return null
    }
}

// Редактирование количества товаров в корзине недоступно на странице корзины

// Функция для удаления товара из корзины
const removeFromCart = async (productId) => {
    const user = await getUserData()
    const productListString = localStorage.getItem(user.id)
    if (!productListString) return []

    const productList = JSON.parse(productListString)
    const index = productList.findIndex(p => p.id == productId)

    if (index > -1) {
        productList.splice(index, 1);
        localStorage.setItem(user.id, JSON.stringify(productList));
    }

    return productList
}

// Функция для создания HTML элемента товара в корзине
const createCartItemHTML = (product, quantity) => {
    const totalPrice = parseFloat(product.price.replace(',', '.')) * quantity

    return `
        <div class="cart-item" data-product-id="${product.id}">
            <img src="${product.image_url}" alt="${product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${product.name}</div>
                <div class="cart-item-price">${product.price} ₽</div>
                <div class="cart-item-quantity">
                    <span>Количество: ${quantity}</span>
                </div>
            </div>
            <div class="cart-item-total">${totalPrice.toFixed(2)} ₽</div>
            <button class="remove-item" data-product-id="${product.id}">Удалить</button>
        </div>
    `
}

const cartContainer = () => {
    return `
        <h1 class="cart-title">Корзина</h1>
        
        <div class="cart-items" id="cart-items">
            <!-- Товары будут добавлены динамически -->
        </div>
        
        <div class="cart-summary">
            <div class="cart-total">
                <span class="total-label">Итого:</span>
                <span class="total-price" id="total-price">0 ₽</span>
            </div>
            <button class="checkout-button" id="checkout-button">Оформить заказ</button>
        </div>
        
        <div class="empty-cart" id="empty-cart" style="display: none;">
            <p>Ваша корзина пуста</p>
            <a href="../index.html" class="continue-shopping">Продолжить покупки</a>
        </div>
    `
}

// Функция для обновления отображения корзины
const updateCartDisplay = async () => {
    document.querySelector('.cart-container').innerHTML = cartContainer()
    const cartItems = await getCartItems()
    const cartItemsContainer = document.getElementById('cart-items')
    const emptyCartDiv = document.getElementById('empty-cart')
    const cartSummaryDiv = document.querySelector('.cart-summary')

    if (cartItems.length === 0) {
        // Показываем сообщение о пустой корзине
        cartItemsContainer.innerHTML = ''
        emptyCartDiv.style.display = 'block'
        cartSummaryDiv.style.display = 'none'
        return
    }

    // Скрываем сообщение о пустой корзине
    emptyCartDiv.style.display = 'none'
    cartSummaryDiv.style.display = 'block'

    // Очищаем контейнер
    cartItemsContainer.innerHTML = ''

    // Добавляем каждый товар
    for (const cartItem of cartItems) {
        const productInfo = await getProductInfo(cartItem.id)
        if (productInfo) {
            const itemHTML = createCartItemHTML(productInfo, cartItem.count)
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML)

            // Добавляем обработчики к последнему добавленному элементу
            const lastElement = cartItemsContainer.lastElementChild
            if (lastElement) {
                console.log('Adding event listeners to cart item:', cartItem.id)
                addEventListenersToElement(lastElement)
            } else {
                console.log('Failed to find last element for product:', cartItem.id)
            }
        }
    }

    // Обновляем общую сумму
    await updateTotalSum()

    // Добавляем обработчик для кнопки оформления заказа
    const checkoutButton = document.getElementById('checkout-button')
    if (checkoutButton && !checkoutButton.hasAttribute('data-listener-added')) {
        console.log('Adding checkout button listener')
        checkoutButton.setAttribute('data-listener-added', 'true')
        checkoutButton.addEventListener('click', async () => {
            const cartItems = await getCartItems()

            if (cartItems.length === 0) {
                alert('Корзина пуста!')
                return
            }

            // Получаем данные пользователя
            const user = await getUserData()

            // Создаем Telegram ссылку с заказом
            const telegramLink = await createTelegramOrderLink(cartItems, user)

            if (telegramLink) {
                // Проверяем, находимся ли мы в Telegram Mini App
                const telegramExists = typeof Telegram !== 'undefined' && Telegram && Telegram.WebApp;

                if (telegramExists) {
                    // В Telegram Mini App используем встроенный метод
                    try {
                        Telegram.WebApp.openTelegramLink(telegramLink);
                    } catch (error) {
                        window.location.href = telegramLink;
                    }
                } else {
                    // В обычном браузере перенаправляем на страницу
                    window.location.href = telegramLink;
                }

                // Очищаем корзину после отправки заказа
                localStorage.removeItem(user.id)
                await updateCartDisplay()
            } else {
                alert('Ошибка при создании заказа. Попробуйте еще раз.')
            }
        })
    }
}


// Функция для быстрого обновления общей суммы
const updateTotalSum = async () => {
    const cartItems = await getCartItems()
    let totalSum = 0

    // Используем кэшированные цены из DOM для быстрого расчета
    for (const cartItem of cartItems) {
        const cartItemElement = document.querySelector(`[data-product-id="${cartItem.id}"]`)
        if (cartItemElement) {
            const priceElement = cartItemElement.querySelector('.cart-item-price')
            if (priceElement) {
                const price = parseFloat(priceElement.textContent.replace(' ₽', '').replace(',', '.'))
                totalSum += price * cartItem.count
            }
        }
    }

    const totalPriceElement = document.getElementById('total-price')
    if (totalPriceElement) {
        totalPriceElement.textContent = `${totalSum.toFixed(2)} ₽`
    }
}

// Функция для создания Telegram ссылки с заказом
const createTelegramOrderLink = async (cartItems, user) => {
    try {
        // Получаем информацию о товарах
        const orderItems = [];
        let totalSum = 0;

        for (const cartItem of cartItems) {
            const productInfo = await getProductInfo(cartItem.id);

            if (productInfo) {
                const itemTotal = parseFloat(productInfo.price.replace(',', '.')) * cartItem.count;
                totalSum += itemTotal;

                orderItems.push({
                    name: productInfo.name,
                    price: productInfo.price,
                    quantity: cartItem.count,
                    total: itemTotal.toFixed(2)
                });
            }
        }

        // Формируем текст заказа
        const orderText = `🛒 *Новый заказ*
        
👤 *Покупатель:* ID ${user.id}
📅 *Дата:* ${new Date().toLocaleString('ru-RU')}

*Товары:*
${orderItems.map(item =>
            `• ${item.name} - ${item.price} ₽ × ${item.quantity} = ${item.total} ₽`
        ).join('\n')}

💰 *Итого:* ${totalSum.toFixed(2)} ₽

---
_Заказ создан через Mini App_`;

        // Кодируем текст для URL
        const encodedText = encodeURIComponent(orderText);

        // Получаем username продавца из localStorage или используем test_seller
        const telegramUsername = localStorage.getItem('seller_username') || user.id;
        const telegramLink = `https://t.me/${telegramUsername}?text=${encodedText}`;

        return telegramLink;

    } catch (error) {
        console.error('Ошибка создания Telegram ссылки:', error);
        return null;
    }
};

// Функция для добавления обработчиков к конкретному элементу
const addEventListenersToElement = (element) => {
    console.log('Adding event listeners to element:', element)

    // Обработчик для кнопки удаления
    const removeBtn = element.querySelector('.remove-item')
    if (removeBtn && !removeBtn.hasAttribute('data-listener-added')) {
        console.log('Adding remove button listener for product:', removeBtn.dataset.productId)
        removeBtn.setAttribute('data-listener-added', 'true')
        removeBtn.addEventListener('click', async (e) => {
            e.preventDefault()
            console.log('Remove button clicked for product:', e.target.dataset.productId)
            const productId = e.target.dataset.productId
            await removeFromCart(productId)
            await updateCartDisplay()
        })
    }
}


// Показываем прелоадер сразу при загрузке
showPreloader();
setPreloaderText('Загрузка корзины...', 'Пожалуйста, подождите');

// Инициализация страницы
waitForTelegram(async () => {
    try {
        console.log('Загружаем корзину...')

        // Ждем полной инициализации Telegram WebApp
        await waitForTelegramReady();

        await updateCartDisplay()

            // Скрываем прелоадер
    hidePreloader();

    console.log('Cart: Application fully loaded');
} catch (error) {
    console.error('Error loading cart:', error);
    hidePreloader();
}

console.log('Корзина загружена!')
}) 