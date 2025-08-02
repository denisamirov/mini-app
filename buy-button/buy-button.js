
const btnList = document.querySelectorAll('.product-buy-button')

const initData = Telegram.WebApp.initData
const params = new URLSearchParams(initData)
const userData = params.get('user');
const user = userData ? JSON.parse(userData) : { id: 215430 };

const getQuantityInputHTML = (btnProductId) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="1" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`

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
            const input = document.querySelector(`input[btn_product_id="${btnProductId}"]`).value
            if (input && input == 0) {
                createAndReplaceButton(btnProductId);
            } else {
                initializeQuantityControls(btnProductId)
            }
        }
    })
})

const createAndReplaceButton = (btnProductId) => {
    const btn = document.createElement('button')
    btn.setAttribute('btn_product_id', btnProductId)
    btn.classList.add('buy-button')
    btn.textContent = 'Добавить'

    document.querySelector(`[btn_product_id="${btnProductId}"]`)
        .querySelector('.input-group')
        .replaceWith(btn)
}


const updateProductsFromStorage = (id, isAdd) => {
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