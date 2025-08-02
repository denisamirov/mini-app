// Универсальная функция для получения ID пользователя с ожиданием Telegram
export const getUserData = async () => {
    // Ждем инициализации Telegram WebApp
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        try {
            // Ждем готовности Telegram WebApp с таймаутом
            await new Promise((resolve) => {
                const checkReady = () => {
                    if (Telegram.WebApp.isExpanded !== undefined) {
                        resolve();
                    } else {
                        Telegram.WebApp.ready();
                        setTimeout(checkReady, 50);
                    }
                };
                checkReady();
            });
            
            // Дополнительная задержка для полной инициализации
            await new Promise(resolve => setTimeout(resolve, 200));
            
            if (Telegram.WebApp.initData) {
                const initData = Telegram.WebApp.initData
                const params = new URLSearchParams(initData)
                const userData = params.get('user');
                console.log('Telegram initData:', initData);
                console.log('Telegram userData:', userData);
                return userData ? JSON.parse(userData) : { id: 215430 };
            }
        } catch (error) {
            console.log('Telegram WebApp error:', error);
        }
    }
    
    // Fallback для обычного браузера или ошибки
    console.log('Using fallback user ID: 215430');
    return { id: 215430 };
} 