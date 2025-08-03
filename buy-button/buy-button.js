
// Импортируем универсальную функцию getUserData
import { getUserData } from '../telegram.js';

// Функция инициализации кнопок
const initializeBuyButtons = () => {
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

    const getQuantityInputHTML = (btnProductId) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="1" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`

    const initializeQuantityControls = (user, btnProductId) => {

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
                updateProductsFromStorage(user, btnProductId, true);
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
                    updateProductsFromStorage(user, btnProductId, false);
                    
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


    const createAndReplaceButton = (btnProductId) => {
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
                updateProductsFromStorage(user, btnProductId, true)
                container.innerHTML = getQuantityInputHTML(btnProductId)
                initializeQuantityControls(user, btnProductId)
            })
        } else {
            console.log('Container not found for product:', btnProductId)
        }
    }


    const updateProductsFromStorage = (user, id, isAdd) => {
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
} // Закрываем функцию initializeBuyButtons

// Экспортируем функцию инициализации
export { initializeBuyButtons };
