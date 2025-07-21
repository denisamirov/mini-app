export const loadTelegramJS = () => {
    const script = document.createElement('script')
    script.src = "https://telegram.org/js/telegram-web-app.js"
    document.head.insertBefore(script, document.head.firstChild)
    script.onload = init
}

const init = () => {
    const tg = window.Telegram?.WebApp;
    console.log('The TelegramJS was uploaded successfully')
    if (!tg) throw new Error('The TelegramJS was not uploaded')

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

