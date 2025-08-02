
// Функция инициализации кнопок
const initializeBuyButtons = () => {
    const btnList = document.querySelectorAll('.product-buy-button')

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
                    const input = document.querySelector(`input[btn_product_id="${btnProductId}"]`).value
                    if (input && input == 0) {
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
                if (quantityInput && quantityInput.value >= 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                    updateProductsFromStorage(user, btnProductId, false);
                }
            };
            decreaseBtn.addEventListener('click', decreaseBtn.decreaseHandler);
        }
    }


    const createAndReplaceButton = (btnProductId) => {
        const btn = document.createElement('button')
        btn.setAttribute('btn_product_id', btnProductId)
        btn.classList.add('buy-button')
        btn.textContent = 'Добавить'

        document.querySelector(`[btn_product_id="${btnProductId}"]`)
            .querySelector('.input-group')
            .replaceWith(btn)
    }


    const updateProductsFromStorage = (user, id, isAdd) => {
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
} // Закрываем функцию initializeBuyButtons

// Вызываем инициализацию
initializeBuyButtons();
