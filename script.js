
window.addEventListener('DOMContentLoaded', () => {

  if (typeof Telegram !== 'undefined' && Telegram.WebApp) {

    Telegram.WebApp.ready();
    
    const user = Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
      document.querySelector('.title').textContent = user.first_name;
    }
  } else {
    console.log("Telegram WebApp не обнаружен");
    document.querySelector('.title').textContent = 'dev';
  }
});