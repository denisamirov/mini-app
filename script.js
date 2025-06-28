if (window.Telegram && Telegram.WebApp) {
    const user = Telegram.WebApp.initDataUnsafe.user;
    document.querySelector('.title').textContent = user.first_name
}

console.log('dev')
document.querySelector('.title').textContent = 'dev'