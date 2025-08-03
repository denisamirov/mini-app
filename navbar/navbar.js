import { loadTelegramJS } from "../telegram.js"

// Загрузка Bootstrap CSS
const loadBootstrapCSS = () => {
    const link = document.createElement('link')
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css'
    link.rel = 'stylesheet'
    link.integrity = 'sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr'
    link.crossOrigin = 'anonymous'
    document.head.insertBefore(link, document.head.firstChild)
}

// Загрузка Bootstrap JS
const loadBootstrapJS = () => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js'
    script.integrity = "sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q"
    script.crossOrigin = 'anonymous'
    script.defer = true
    document.body.appendChild(script)
}

// Безопасная загрузка Telegram JS
const loadTelegramJSSafe = async() => {
    // Проверяем, находимся ли мы в Telegram Mini App
    const isTelegramWebApp = 
        window.location.href.includes('tgWebAppData') ||
        window.location.href.includes('telegram') ||
        window.location.href.includes('t.me') ||
        window.parent?.Telegram?.WebApp ||
        window.opener?.Telegram?.WebApp;
    
    if (isTelegramWebApp) {
        console.log('Telegram Mini App detected, loading Telegram JS...');
        try {
            await loadTelegramJS();
        } catch (error) {
            console.log('Failed to load Telegram JS:', error);
        }
    } else {
        console.log('Not in Telegram Mini App, skipping Telegram JS load');
    }
}

const loadNavBar = () => {
    const pathToTry = [
        './navbar/navbar.html',
        '../navbar/navbar.html'
    ]

    let currentAttempt = 0

    const attemptFetch = () => {
        fetch(pathToTry[currentAttempt])
            .then(res => {
                if (!res.ok) throw new Error('Navbar not found')
                return res.text()
            })
            .then(html => {
                document.body.insertAdjacentHTML('afterbegin', html)
            })
            .catch(err => {
                currentAttempt++
                if (currentAttempt < pathToTry.length) {
                    attemptFetch()
                } else {
                    console.error('All attempts failed', err)
                }
            })
    }

    attemptFetch()
}


const loadScript = () => {
    const pathToTry = [
        './buy-button/buy-button.js',
        '../buy-button/buy-button.js'
    ]

    let currentAttempt = 0

    const attemptFetch = () => {
        fetch(pathToTry[currentAttempt])
            .then(res => {
                if (!res.ok) throw new Error('Script not found')
            })
            .then(r => {
                const script = document.createElement('script');
                script.src = pathToTry[currentAttempt];
                script.defer = true;
                document.head.appendChild(script);
            })
            .catch(err => {
                currentAttempt++
                if (currentAttempt < pathToTry.length) {
                    attemptFetch()
                } else {
                    console.error('All attempts failed', err)
                }
            })
    }

    attemptFetch()
}

window.addEventListener('DOMContentLoaded', async() => {
    await loadTelegramJSSafe();
    loadBootstrapCSS();
    loadBootstrapJS();
    loadNavBar();
})

window.addEventListener('load', () => {
    loadScript()
})