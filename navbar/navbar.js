// Загрузка Bootstrap CSS
const loadBootstrapCSS = () => {
    const link = document.createElement('link')
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css'
    link.rel = 'stylesheet'
    link.integrity = 'sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
}

// Загрузка Bootstrap JS
const loadBootstrapJS = () => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js'
    script.integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q"
    script.crossOrigin = 'anonymous'
    script.defer = true
    document.body.appendChild(script)
}

const loadNavBar = () => {
    fetch('./navbar/navbar.html')
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html)
        })
}

window.addEventListener('DOMContentLoaded', () => {
    loadBootstrapCSS();
    loadBootstrapJS();
    loadNavBar()
})