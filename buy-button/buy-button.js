
// Импортируем универсальную функцию getUserData
import { getUserData } from '../telegram.js';

// Экспортируем функцию для создания HTML кнопки с количеством
export const getQuantityInputHTML = (btnProductId, count = 1) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="${count}" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`

// Экспортируем функцию для обновления localStorage
export const updateProductsFromStorage = async (id, isAdd) => {
    const user = await getUserData();
    const productListString = localStorage.getItem(user.id)
    const productList = productListString ? JSON.parse(productListString) : []
    const product = productList.find(product => product.id == id)

    if (!product) {
        productList.push({ id, count: 1 })
        console.log('Adding new product with count 1')
    }
    else if (isAdd) {
        product.count += 1
        console.log('Increasing product count to:', product.count)
    }
    else if (!isAdd) {
        product.count -= 1
        console.log('Decreasing product count to:', product.count)
        // Удаляем товар из корзины, если количество стало 0
        if (product.count <= 0) {
            const index = productList.findIndex(p => p.id == id);
            if (index > -1) {
                productList.splice(index, 1);
                console.log('Removing product from cart (count <= 0)')
            }
        }
    }
    localStorage.setItem(user.id, JSON.stringify(productList));
    console.log('Updated localStorage:', user.id, localStorage.getItem(user.id))
}

// Экспортируем функцию для инициализации кнопок количества
export const initializeQuantityControls = (btnProductId) => {
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
            console.log('Decrease button clicked, current value:', quantityInput?.value);
            
            if (quantityInput && parseInt(quantityInput.value) >= 1) {
                const newValue = parseInt(quantityInput.value) - 1;
                quantityInput.value = newValue;
                console.log('Decreasing quantity to:', newValue);
                updateProductsFromStorage(btnProductId, false);
                
                // Если количество стало 0, заменяем на кнопку "Добавить"
                if (newValue <= 0) {
                    console.log('Quantity is 0, creating add button');
                    setTimeout(() => {
                        createAndReplaceButton(btnProductId);
                    }, 100);
                }
            } else {
                console.log('Cannot decrease: quantity is already 0 or input not found');
            }
        };
        decreaseBtn.addEventListener('click', decreaseBtn.decreaseHandler);
    }
}

// Экспортируем функцию для создания кнопки "Добавить"
export const createAndReplaceButton = (btnProductId) => {
    console.log('Creating add button for product:', btnProductId)
    const btn = document.createElement('button')
    btn.setAttribute('btn_product_id', btnProductId)
    btn.classList.add('buy-button')
    btn.textContent = 'Добавить'

    const container = document.querySelector(`[btn_product_id="${btnProductId}"]`)
    if (container) {
        container.innerHTML = ''
        container.appendChild(btn)
        console.log('Add button created successfully')
        
        // Добавляем обработчик для новой кнопки
        btn.addEventListener('click', (e) => {
            e.stopPropagation() // Предотвращаем всплытие события
            console.log('Add button clicked, adding product')
            updateProductsFromStorage(btnProductId, true)
            container.innerHTML = getQuantityInputHTML(btnProductId)
            initializeQuantityControls(btnProductId)
        })
    } else {
        console.log('Container not found for product:', btnProductId)
    }
}

// Функция инициализации кнопок для главной страницы
export const initializeBuyButtons = () => {
    const btnList = document.querySelectorAll('.product-buy-button')

    // Ждем инициализации Telegram
    getUserData().then(userData => {
        const user = userData;
        console.log('User initialized:', user);
        console.log(localStorage.getItem(user.id))

        btnList.forEach(btn => {
            const btnProductId = btn.getAttribute('btn_product_id');
            initializeQuantityControls(user, btnProductId);

            btn.addEventListener('click', () => {
                if (btn.querySelector('.buy-button')) {
                    updateProductsFromStorage(user, btnProductId, true)
                    btn.innerHTML = getQuantityInputHTML(btnProductId)
                    initializeQuantityControls(user, btnProductId)
                }
                else {
                    const input = document.querySelector(`input[btn_product_id="${btnProductId}"]`)
                    if (input && parseInt(input.value) <= 0) {
                        createAndReplaceButton(btnProductId);
                    } else {
                        initializeQuantityControls(user, btnProductId)
                    }
                }
            })
        })
    });

    btnList.forEach(btn => {
        const btnProductId = btn.getAttribute('btn_product_id');
        initializeQuantityControls(btnProductId);

        btn.addEventListener('click', () => {
            if (btn.querySelector('.buy-button')) {
                updateProductsFromStorage(btnProductId, true)
                btn.innerHTML = getQuantityInputHTML(btnProductId)
                initializeQuantityControls(btnProductId)
            }
            else {
                const input = document.querySelector(`input[btn_product_id="${btnProductId}"]`)
                if (input && parseInt(input.value) <= 0) {
                    createAndReplaceButton(btnProductId);
                } else {
                    initializeQuantityControls(btnProductId)
                }
            }
        })
    })
} // Закрываем функцию initializeBuyButtons

// Экспортируем все функции

