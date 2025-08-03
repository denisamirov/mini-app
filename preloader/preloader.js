// Функция для загрузки CSS прелоадера
const loadPreloaderCSS = () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    
    // Пробуем разные пути для CSS
    const cssPaths = [
        './preloader/preloader.css',
        '../preloader/preloader.css'
    ]
    
    let currentAttempt = 0
    
    const attemptCSS = () => {
        link.href = cssPaths[currentAttempt]
        link.onload = () => console.log('Preloader CSS loaded from:', cssPaths[currentAttempt])
        link.onerror = () => {
            currentAttempt++
            if (currentAttempt < cssPaths.length) {
                attemptCSS()
            } else {
                console.error('Failed to load preloader CSS from all paths')
            }
        }
        document.head.appendChild(link)
    }
    
    attemptCSS()
}

// Функция для загрузки HTML прелоадера
const loadPreloaderHTML = async () => {
    const htmlPaths = [
        './preloader/preloader.html',
        '../preloader/preloader.html'
    ]
    
    let currentAttempt = 0
    
    const attemptHTML = async () => {
        try {
            const response = await fetch(htmlPaths[currentAttempt])
            if (!response.ok) throw new Error('Preloader HTML not found')
            
            const html = await response.text()
            document.body.insertAdjacentHTML('afterbegin', html)
            console.log('Preloader HTML loaded from:', htmlPaths[currentAttempt])
        } catch (error) {
            currentAttempt++
            if (currentAttempt < htmlPaths.length) {
                await attemptHTML()
            } else {
                console.error('Failed to load preloader HTML from all paths:', error)
            }
        }
    }
    
    await attemptHTML()
}

// Функция для показа прелоадера
export const showPreloader = () => {
    const preloader = document.getElementById('preloader')
    if (preloader) {
        preloader.classList.remove('hidden')
    }
}

// Функция для скрытия прелоадера
export const hidePreloader = () => {
    const preloader = document.getElementById('preloader')
    if (preloader) {
        preloader.classList.add('hidden')
    }
}

// Функция для изменения текста прелоадера
export const setPreloaderText = (text, subtext = 'Пожалуйста, подождите') => {
    const preloader = document.getElementById('preloader')
    if (preloader) {
        const textElement = preloader.querySelector('.preloader-text')
        const subtextElement = preloader.querySelector('.preloader-subtext')
        
        if (textElement) textElement.textContent = text
        if (subtextElement) subtextElement.textContent = subtext
    }
}

// Функция для инициализации прелоадера
export const initializePreloader = async () => {
    loadPreloaderCSS()
    await loadPreloaderHTML()
} 