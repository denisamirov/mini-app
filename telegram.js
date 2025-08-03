export const loadTelegramJS = async() => {
    const script = document.createElement('script')
    script.src = "https://telegram.org/js/telegram-web-app.js"
    document.head.insertBefore(script, document.head.firstChild)
    script.onload = async() => {
        await init()
    }
    script.onerror = () => {
        console.log('Failed to load Telegram WebApp library from CDN');
    }
}

const init = async () => {
    const tg = window.Telegram?.WebApp;
    console.log('The TelegramJS was uploaded successfully')
    if (!tg) {
        console.error('The TelegramJS was not uploaded, but continuing...');
        return;
    }

    const root = document.documentElement

    updateTheme(root, tg)

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
    console.log('getUserData called');
    
    // Безопасная проверка существования Telegram
    const telegramExists = typeof Telegram !== 'undefined' && Telegram;
    console.log('typeof Telegram:', typeof Telegram);
    console.log('Telegram object:', telegramExists ? 'exists' : 'undefined');
    
    // Проверяем различные способы определения Telegram Mini App
    const isTelegramWebApp = 
        telegramExists && 
        Telegram.WebApp &&
        (window.Telegram || window.telegram || Telegram.WebApp.initData || Telegram.WebApp.isExpanded !== undefined) ||
        // window.parent?.Telegram?.WebApp ||
        // window.opener?.Telegram?.WebApp ||
        window.location.href.includes('tgWebAppData') ||
        window.location.href.includes('telegram') ||
        window.location.href.includes('t.me');
    
    console.log('isTelegramWebApp:', isTelegramWebApp);
    
    if (isTelegramWebApp && telegramExists) {
        try {
            // Ждем готовности Telegram WebApp с более длительным таймаутом
            await new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 100; // 5 секунд максимум
                
                const checkReady = () => {
                    attempts++;
                    console.log(`Telegram initialization attempt ${attempts}/${maxAttempts}`);
                    
                    if (Telegram.WebApp.isExpanded !== undefined) {
                        console.log('Telegram WebApp is ready');
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        console.log('Telegram WebApp initialization timeout');
                        reject(new Error('Telegram initialization timeout'));
                    } else {
                        Telegram.WebApp.ready();
                        setTimeout(checkReady, 50);
                    }
                };
                checkReady();
            });
            
            // Дополнительная задержка для полной инициализации
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('Checking Telegram initData...');
            if (Telegram.WebApp.initData) {
                const initData = Telegram.WebApp.initData
                console.log('Telegram initData found:', initData);
                
                const params = new URLSearchParams(initData)
                const userData = params.get('user');
                console.log('Telegram userData:', userData);
                
                if (userData) {
                    try {
                        const parsedUserData = JSON.parse(userData);
                        console.log('Parsed user data:', parsedUserData);
                        return parsedUserData;
                    } catch (parseError) {
                        console.log('Error parsing userData:', parseError);
                        return { id: 215430 };
                    }
                } else {
                    console.log('No userData in initData, using fallback');
                    return { id: 215430 };
                }
            } else {
                console.log('No initData available, using fallback');
                return { id: 215430 };
            }
        } catch (error) {
            console.log('Telegram WebApp error:', error);
            console.log('Using fallback due to error');
            return { id: 215430 };
        }
    }
    
    // Проверяем URL параметры для Telegram Mini App
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    const userData = urlParams.get('user');
    
    if (tgWebAppData || userData) {
        console.log('Telegram Mini App detected via URL parameters or parent window');
        if (userData) {
            try {
                const parsedUserData = JSON.parse(userData);
                console.log('Parsed user data from URL:', parsedUserData);
                return parsedUserData;
            } catch (parseError) {
                console.log('Error parsing userData from URL:', parseError);
            }
        }
        
        // Пробуем получить данные из parent window
        if (window.parent?.Telegram?.WebApp?.initData) {
            console.log('Found Telegram WebApp in parent window');
            const initData = window.parent.Telegram.WebApp.initData;
            const params = new URLSearchParams(initData);
            const parentUserData = params.get('user');
            if (parentUserData) {
                try {
                    const parsedUserData = JSON.parse(parentUserData);
                    console.log('Parsed user data from parent:', parsedUserData);
                    return parsedUserData;
                } catch (parseError) {
                    console.log('Error parsing userData from parent:', parseError);
                }
            }
        }
        
        // Пробуем получить данные из opener window
        if (window.opener?.Telegram?.WebApp?.initData) {
            console.log('Found Telegram WebApp in opener window');
            const initData = window.opener.Telegram.WebApp.initData;
            const params = new URLSearchParams(initData);
            const openerUserData = params.get('user');
            if (openerUserData) {
                try {
                    const parsedUserData = JSON.parse(openerUserData);
                    console.log('Parsed user data from opener:', parsedUserData);
                    return parsedUserData;
                } catch (parseError) {
                    console.log('Error parsing userData from opener:', parseError);
                }
            }
        }
    }
    
    // Fallback для обычного браузера или ошибки
    console.log('No Telegram WebApp detected, using fallback user ID: 215430');
    return { id: 215430 };
} 