// Функция для получения ID пользователя
const getUserData = () => {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initData) {
        const initData = Telegram.WebApp.initData
        const params = new URLSearchParams(initData)
        const userData = params.get('user');
        return userData ? JSON.parse(userData) : { id: 215430 };
    } else {
        return { id: 215430 };
    }
}

export const getQuantityInputHTML = (btnProductId, count) => `
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
                    const user = getUserData();
                    const userData = localStorage.getItem(user.id);
                    if (!userData) return `<button class="buy-button">Добавить</button>`;
                    try {
                        const products = JSON.parse(userData);
                        const p = products.find(item => item.id === product.id);
                        if (p && p.count > 0) 
                            return getQuantityInputHTML(p.id, p.count)
                        else 
                            return `<button class="buy-button">Добавить</button>`;
                    } catch (e) {
                        return `<button class="buy-button">Добавить</button>`;
                    }
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

const user = getUserData();
const userData = localStorage.getItem(user.id);
console.log('User ID:', user.id);
console.log('User data:', userData);
