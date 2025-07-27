
const btnList = document.querySelectorAll('.product-buy-button')

const getQuantityInputHTML = (btnProductId) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="1" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`

const initializeQuantityControls = (btnProductId) => {
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function () {
            let quantityInput = button.parentElement.querySelector(`[btn_product_id="${btnProductId}"]`);

            if (!quantityInput) return

            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    });

    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function () {
            let quantityInput = button.parentElement.querySelector(`[btn_product_id="${btnProductId}"]`);
            if (quantityInput && quantityInput.value > 1) {
                quantityInput.value = parseInt(quantityInput.value) - 1;
            }
        });
    });
}

btnList.forEach(btn => {
    btn.addEventListener('click', () => {
        const btnProductId = btn.getAttribute('btn_product_id')
        if (btn.querySelector('.buy-button')) {
            btn.innerHTML = getQuantityInputHTML(btnProductId)
            initializeQuantityControls(btnProductId)
        }
        else {
            const input = document.querySelector(`input[btn_product_id="${btnProductId}"]`).value
            if (input && input <= 1) 
                createAndReplaceButton(btnProductId)
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
