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


/** Универсальная функция для получения ID пользователя с ожиданием Telegram */
export const getUserData = async () => {
    const testUser = { id: 215430 }
    const initData = Telegram.WebApp.initData

    if (initData) {

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


export const waitForTelegram = (callback, maxWaitTime = 5000) => {
    if (window.Telegram?.WebApp) {
        callback();
    } else {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
            if (window.Telegram?.WebApp) {
                clearInterval(checkInterval);
                callback();
            } else if (Date.now() - startTime > maxWaitTime) {
                clearInterval(checkInterval);
                console.warn('Telegram WebApp not found within timeout period');
            }
        }, 100);
    }
}


/** Функция для ожидания полной загрузки Telegram WebApp */
export const waitForTelegramReady = (maxWaitTime = 5000) => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const telegramExists = typeof Telegram !== 'undefined' && Telegram && Telegram.WebApp;

        const checkReady = () => {
            if (telegramExists && Telegram.WebApp.isExpanded !== undefined) {
                console.log('Telegram WebApp is now ready');
                resolve();
            } else if (Date.now() - startTime > maxWaitTime) {
                console.error('Telegram WebApp not ready within timeout period');
                resolve();
            } else {
                setTimeout(checkReady, 100);
            }
        };
        checkReady();
    });
}

export { showPreloader, hidePreloader, setPreloaderText, initializePreloader };