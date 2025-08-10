import { showPreloader, hidePreloader, setPreloaderText, initializePreloader } from './preloader/preloader.js';

export const loadTelegramJS = () => {
    const script = document.createElement('script')
    script.src = "https://telegram.org/js/telegram-web-app.js"
    script.defer = true
    document.head.insertBefore(script, document.head.firstChild)
    script.onload = init
}

const init = () => {
    const tg = window.Telegram?.WebApp

    if (!tg) {
        console.error('The TelegramJS was not uploaded')
        return;
    }

    console.log('The TelegramJS was uploaded successfully')

    updateTheme(document.documentElement, tg)
    tg.onEvent('themeChanged', updateTheme)
}

const updateTheme = (root, tg) => {
    const {
        bg_color,
        text_color,
        hint_color,
        button_color,
        button_text_color,
        link_color
    } = tg.themeParams

    bg_color && root.style.setProperty('--tg-theme-bg-color', bg_color)
    text_color && root.style.setProperty('--tg-theme-text-color', text_color)
    hint_color && root.style.setProperty('--tg-theme-hint-color', hint_color)
    button_color && root.style.setProperty('--tg-theme-button-color', button_color)
    button_text_color && root.style.setProperty('--tg-theme-button-text-color', button_text_color)
    link_color && root.style.setProperty('--tg-theme-link-color', link_color)
}


// Универсальная функция для получения ID пользователя с ожиданием Telegram
export const getUserData = async () => {
    const testUser = { id: 215430 }

    if (Telegram.WebApp.initData) {
        const initData = Telegram.WebApp.initData

        const params = new URLSearchParams(initData)
        const userData = params.get('user')

        if (userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                console.log('Parsed user data:', parsedUserData);
                return parsedUserData;
            } catch (parseError) {
                console.log('Error parsing userData:', parseError);
                return testUser;
            }
        } else {
            console.log('No userData in initData, using fallback');
            return testUser;
        }
    }

    console.log('No Telegram WebApp detected, using fallback user');
    return testUser;
}


export const waitForTelegram = (callback) => {
    if (window.Telegram?.WebApp) {
        callback();
    } else {
        const checkInterval = setInterval(() => {
            if (window.Telegram?.WebApp) {
                clearInterval(checkInterval);
                callback();
            }
        }, 100);
    }
}


// Функция для ожидания полной загрузки Telegram WebApp
export const waitForTelegramReady = () => {
    return new Promise((resolve) => {
        const telegramExists = typeof Telegram !== 'undefined' && Telegram && Telegram.WebApp;

        if (telegramExists && Telegram.WebApp.isExpanded !== undefined) {
            console.log('Telegram WebApp already ready');
            resolve();
        } else {
            const checkReady = () => {
                if (Telegram?.WebApp && Telegram.WebApp.isExpanded !== undefined) {
                    console.log('Telegram WebApp is now ready');
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        }
    });
}

export { showPreloader, hidePreloader, setPreloaderText, initializePreloader };