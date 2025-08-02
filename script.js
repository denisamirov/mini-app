const getQuantityInputHTML = (btnProductId, count) => `
    <div class="input-group product-input-amount">
        <button class="btn btn-outline-secondary decrease">-</button>
        <input type="number" class="form-control text-center quantity" value="${count}" min="1" btn_product_id=${btnProductId} readonly>
        <button class="btn btn-outline-secondary increase">+</button>
    </div>`


const container = document.querySelector('.card-list')

container.innerHTML = ''

const productTemplate = (product) => `
        <div class="card">
            <a href="./product/product.html?id=${product.id}">
                <img class="card-img" src="${product.image_url}" alt="картинка">
            </a>
            <div class="card-content">
                <div class="card-content-description">
                    <h2 class="card-price">${product.price}</h2>
                    <p class="card-title">${product.name}</p>
                </div>
                <div class="product-buy-button" btn_product_id=${product.id}>
                ${(() => {
                    const userData = localStorage.getItem(215430);
                    if (!userData) return `<button class="buy-button">Добавить</button>`;
                    const products = JSON.parse(userData);
                    const p = products.find(item => item.id === product.id)
                    return p ? getQuantityInputHTML(p.id, p.count) :
                `<button class="buy-button">Добавить</button>`;
    })()}
                </div>
            </div>
        </div>
`

const response = await fetch('./goods.json')

if (!response.ok) throw new Error('Ошибка загрузки товаров')

const goods = await response.json()

goods.forEach(product => {
    container.insertAdjacentHTML('beforeend', productTemplate(product))
});

const user = localStorage.getItem(215430)
console.log(user)