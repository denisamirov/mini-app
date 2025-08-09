// Импортируем универсальную функцию getUserData и функции прелоадера
import { getUserData, waitForTelegram, showPreloader, hidePreloader, waitForTelegramReady, setPreloaderText } from '../telegram.js';
import { render } from '../utils/render.js';

// Функция для получения товаров из localStorage
const getCartItems = async () => {
    const { id } = await getUserData()
    const raw = localStorage.getItem(id)
    if (!raw) return []
    try { return JSON.parse(raw) } catch { return [] }
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

// Отрисовка каркаса корзины
const renderCartScaffold = () => {
    const container = document.querySelector('.cart-container')
    container.innerHTML = cartContainer()
}

// Получение ссылок на ключевые DOM-элементы корзины
const getCartDomRefs = () => {
    return {
        cartItemsContainer: document.getElementById('cart-items'),
        emptyCartDiv: document.getElementById('empty-cart'),
        cartSummaryDiv: document.querySelector('.cart-summary'),
    }
}

// Переключение состояния пустой/непустой корзины
const setEmptyCartState = (isEmpty, refs) => {
    const { cartItemsContainer, emptyCartDiv, cartSummaryDiv } = refs
    if (isEmpty) {
        cartItemsContainer.innerHTML = ''
        emptyCartDiv.style.display = 'block'
        cartSummaryDiv.style.display = 'none'
        return
    }
    emptyCartDiv.style.display = 'none'
    cartSummaryDiv.style.display = 'block'
}

// Рендер товаров корзины (через универсальную утилиту)
const renderCartItems = async (cartItems, container) => {
    await render({
        source: cartItems,
        container,
        template: async (cartItem) => {
            const productInfo = await getProductInfo(cartItem.id)
            if (!productInfo) return null
            return createCartItemHTML(productInfo, cartItem.count)
        },
        options: {
            clearContainer: true,
            afterInsert: (element) => addEventListenersToElement(element)
        }
    })
}

// Обработчик кнопки оформления заказа
const attachCheckoutHandler = () => {
    const checkoutButton = document.getElementById('checkout-button')
    if (!checkoutButton || checkoutButton.hasAttribute('data-listener-added')) return

    console.log('Adding checkout button listener')
    checkoutButton.setAttribute('data-listener-added', 'true')
    checkoutButton.addEventListener('click', async () => {
        const cartItems = await getCartItems()
        if (cartItems.length === 0) {
            alert('Корзина пуста!')
            return
        }

        const user = await getUserData()
        const telegramLink = await createTelegramOrderLink(cartItems, user)

        if (telegramLink) {
            const telegramExists = typeof Telegram !== 'undefined' && Telegram && Telegram.WebApp
            if (telegramExists) {
                try {
                    Telegram.WebApp.openTelegramLink(telegramLink)
                } catch (error) {
                    window.location.href = telegramLink
                }
            } else {
                window.location.href = telegramLink
            }

            localStorage.removeItem(user.id)
            await updateCartDisplay()
        } else {
            alert('Ошибка при создании заказа. Попробуйте еще раз.')
        }
    })
}

// Обновление отображения корзины (оркестратор)
const updateCartDisplay = async () => {
    renderCartScaffold()
    const cartItems = await getCartItems()
    const refs = getCartDomRefs()

    const isEmpty = cartItems.length === 0
    setEmptyCartState(isEmpty, refs)
    if (isEmpty) return

    await renderCartItems(cartItems, refs.cartItemsContainer)
    await updateTotalSum()
    attachCheckoutHandler()
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

// Построение данных заказа
const buildOrderData = async (cartItems) => {
    const orderItems = []
    let totalSum = 0

    for (const cartItem of cartItems) {
        const productInfo = await getProductInfo(cartItem.id)
        if (!productInfo) continue

        const itemTotal = parseFloat(productInfo.price.replace(',', '.')) * cartItem.count
        totalSum += itemTotal
        orderItems.push({
            name: productInfo.name,
            price: productInfo.price,
            quantity: cartItem.count,
            total: itemTotal.toFixed(2),
        })
    }

    return { orderItems, totalSum }
}

// Формирование текста заказа
const buildOrderText = (orderItems, totalSum, userId) => {
    return `🛒 *Новый заказ*
        
👤 *Покупатель:* ID ${userId}
📅 *Дата:* ${new Date().toLocaleString('ru-RU')}

*Товары:*
${orderItems.map(item => `• ${item.name} - ${item.price} ₽ × ${item.quantity} = ${item.total} ₽`).join('\n')}

💰 *Итого:* ${totalSum.toFixed(2)} ₽

---
_Заказ создан через Mini App_`
}

// Сборка Telegram ссылки
const buildTelegramLink = (orderText, user) => {
    const encodedText = encodeURIComponent(orderText)
    const telegramUsername = localStorage.getItem('seller_username') || user.id
    return `https://t.me/${telegramUsername}?text=${encodedText}`
}

// Функция для создания Telegram ссылки с заказом
const createTelegramOrderLink = async (cartItems, user) => {
    try {
        const { orderItems, totalSum } = await buildOrderData(cartItems)
        const orderText = buildOrderText(orderItems, totalSum, user.id)
        return buildTelegramLink(orderText, user)
    } catch (error) {
        console.error('Ошибка создания Telegram ссылки:', error)
        return null
    }
}

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