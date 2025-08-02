// Импортируем универсальную функцию getUserData
import { getUserData } from '../shared/user.js';

// Функция для получения товаров из localStorage
const getCartItems = async () => {
    const user = await getUserData()
    const productListString = localStorage.getItem(user.id)
    if (!productListString) return []
    
    try {
        return JSON.parse(productListString)
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

// Функция для обновления localStorage
const updateProductsFromStorage = async (id, isAdd) => {
    const user = await getUserData()
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
        // Удаляем товар из корзины, если количество стало 0
        if (product.count <= 0) {
            const index = productList.findIndex(p => p.id == id);
            if (index > -1) {
                productList.splice(index, 1);
            }
        }
    }

    localStorage.setItem(user.id, JSON.stringify(productList));
    return productList
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
                    <span>Количество:</span>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-product-id="${product.id}">-</button>
                        <input type="number" class="quantity-input" value="${quantity}" min="1" readonly>
                        <button class="quantity-btn increase-btn" data-product-id="${product.id}">+</button>
                    </div>
                </div>
            </div>
            <div class="cart-item-total">${totalPrice.toFixed(2)} ₽</div>
            <button class="remove-item" data-product-id="${product.id}">Удалить</button>
        </div>
    `
}

// Функция для обновления отображения корзины
const updateCartDisplay = async () => {
    const cartItems = getCartItems()
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
    
    let totalSum = 0
    
    // Добавляем каждый товар
    for (const cartItem of await cartItems) {
        const productInfo = await getProductInfo(cartItem.id)
        if (productInfo) {
            const itemHTML = createCartItemHTML(productInfo, cartItem.count)
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML)
            
            // Добавляем к общей сумме
            const itemPrice = parseFloat(productInfo.price.replace(',', '.'))
            totalSum += itemPrice * cartItem.count
        }
    }
    
    // Обновляем общую сумму
    document.getElementById('total-price').textContent = `${totalSum.toFixed(2)} ₽`
    
    // Добавляем обработчики событий
    addEventListeners()
}

// Функция для добавления обработчиков событий
const addEventListeners = () => {
    // Обработчики для кнопок увеличения количества
    document.querySelectorAll('.increase-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.productId
            updateProductsFromStorage(productId, true)
            await updateCartDisplay()
        })
    })
    
    // Обработчики для кнопок уменьшения количества
    document.querySelectorAll('.decrease-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.productId
            updateProductsFromStorage(productId, false)
            await updateCartDisplay()
        })
    })
    
    // Обработчики для кнопок удаления
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.productId
            removeFromCart(productId)
            await updateCartDisplay()
        })
    })
    
    // Обработчик для кнопки оформления заказа
    const checkoutButton = document.getElementById('checkout-button')
    checkoutButton.addEventListener('click', async () => {
        const cartItems = await getCartItems()
        if (cartItems.length === 0) {
            alert('Корзина пуста!')
            return
        }
        
        // Здесь можно добавить логику оформления заказа
        alert('Заказ оформлен! Спасибо за покупку!')
        
        // Очищаем корзину после оформления заказа
        const user = await getUserData()
        localStorage.removeItem(user.id)
        updateCartDisplay()
    })
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Загружаем корзину...')
    await updateCartDisplay()
    console.log('Корзина загружена!')
}) 