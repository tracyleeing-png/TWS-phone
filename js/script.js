(function () {
    'use strict';
    const screen = document.getElementById('ekran');
    const phoneApp = document.getElementById('phoneApp');
    const frame = document.getElementById('phoneAppFrame');
    const closeButton = document.getElementById('closePhoneApp');
    const appButtons = Array.from(document.querySelectorAll('[data-app][data-url]'));
    const notification = document.getElementById('storyNotification');
    const notificationApp = document.getElementById('notificationApp');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationBody = document.getElementById('notificationBody');
    const notificationTime = document.getElementById('notificationTime');
    const chapterBadge = document.getElementById('chapterBadge');
    const engine = window.TWSGame.engine();
    let isOff = false;
    let activeApp = null;
    let lastNotificationId = null;

    function appUrl(app) {
        const button = appButtons.find((item) => item.dataset.app === app);
        return button ? button.dataset.url : 'kakaotalk/index.html';
    }

    function openApp(app, url) {
        const nextUrl = url || appUrl(app);
        activeApp = app;
        if (frame.dataset.current !== nextUrl) {
            frame.src = nextUrl;
            frame.dataset.current = nextUrl;
        }
        frame.title = `${app} 应用`;
        phoneApp.hidden = false;
        phoneApp.setAttribute('aria-hidden', 'false');
        document.body.classList.add('app-running');
        requestAnimationFrame(() => phoneApp.classList.add('visible'));
        closeButton.focus();
    }

    function closeApp() {
        phoneApp.classList.remove('visible');
        phoneApp.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('app-running');
        setTimeout(() => { phoneApp.hidden = true; activeApp = null; }, 260);
    }

    function renderSystem() {
        engine.reload();
        const state = engine.state;
        document.getElementById('realTime').textContent = state.gameTime;
        chapterBadge.textContent = state.chapterLabel;
        const unread = state.notifications.filter((item) => !item.read).slice(-1)[0];
        if (unread && unread.id !== lastNotificationId && !activeApp) {
            lastNotificationId = unread.id;
            notificationApp.textContent = unread.app === 'forum' ? '校园论坛' : unread.app === 'calendar' ? '日历' : unread.app === 'system' ? state.chapterLabel : 'KakaoTalk';
            notificationTitle.textContent = unread.title;
            notificationBody.textContent = unread.body;
            notificationTime.textContent = unread.time;
            notification.dataset.app = unread.app;
            notification.dataset.thread = unread.threadId || '';
            notification.hidden = false;
            setTimeout(() => { if (notification.dataset.app === unread.app) notification.hidden = true; }, 5200);
        }
    }

    function runStoryScheduler() {
        const delivered = engine.runScheduler(false);
        if (delivered.length) renderSystem();
    }

    window.addEventListener('DOMContentLoaded', () => {
        screen.style.display = 'block';
        window.TWSProfile.bind();
        engine.start(window.TWSProfile.load().name, false);
        renderSystem();
        const requested = new URLSearchParams(window.location.search).get('open');
        if (requested) openApp(requested, appUrl(requested));
    });

    appButtons.forEach((button) => button.addEventListener('click', () => openApp(button.dataset.app, button.dataset.url)));
    closeButton.addEventListener('click', closeApp);
    notification.addEventListener('click', () => {
        const app = notification.dataset.app === 'system' ? 'kakaotalk' : notification.dataset.app;
        notification.hidden = true;
        openApp(app, appUrl(app));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Control') window.ukljuci();
        else if (event.key === 'Escape' && !phoneApp.hidden) closeApp();
    });

    window.ukljuci = function () {
        if (isOff) {
            screen.style.display = 'block';
            isOff = false;
        } else {
            screen.style.display = 'none';
            isOff = true;
            window.TWSProfile.clearUnlocked();
            window.location.href = 'lockscreen/lockscreen.html';
        }
    };

    window.addEventListener('tws-game-updated', renderSystem);
    window.addEventListener('storage', (event) => { if (event.key === window.TWSGame.SAVE_KEY) renderSystem(); });
    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === 'tws-close-app') closeApp();
        if (event.data && event.data.type === 'tws-game-updated') renderSystem();
    });

    setInterval(runStoryScheduler, 500);
    screen.addEventListener('mouseenter', () => { document.body.style.cursor = 'default'; });
    screen.addEventListener('mouseleave', () => { document.body.style.cursor = 'none'; });
}());
