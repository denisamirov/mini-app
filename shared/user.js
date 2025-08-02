// Универсальная функция для получения ID пользователя с ожиданием Telegram
export const getUserData = async () => {
    // Ждем инициализации Telegram WebApp
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        try {
            console.log('Telegram WebApp detected, waiting for initialization...');
            
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
    
    // Fallback для обычного браузера или ошибки
    console.log('No Telegram WebApp detected, using fallback user ID: 215430');
    return { id: 215430 };
} 