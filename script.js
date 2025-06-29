const container = document.querySelector('.card-list')

container.innerHTML = ''

const productTemplate = (product) => `
        <div class="card">
            <img class="card-img" src="${product.image_url}" alt="картинка">
            <div class="card-content">
                <div class="card-content-description">
                    <h2 class="card-price">${product.price}</h2>
                    <p class="card-title">${product.name}</p>
                </div>
                <button class="buy-button">Добавить</button>
            </div>
        </div>
`

const response = await fetch('./goods.json')

if (!response.ok) throw new Error('Ошибка загрузки товаров')

const goods = await response.json()

goods.forEach(product => {
    container.insertAdjacentHTML('beforeend', productTemplate(product))
});