(function () {
    'use strict';

    const app = document.getElementById('kakaoApp');
    const pages = Array.from(document.querySelectorAll('[data-page]'));
    const tabButtons = Array.from(document.querySelectorAll('[data-tab]'));
    const openChatButtons = Array.from(document.querySelectorAll('button.open-chat'));
    const backButton = document.getElementById('backToChats');
    const form = document.getElementById('messageForm');
    const input = document.getElementById('messageInput');
    const conversation = document.getElementById('conversation');
    const sentMessages = document.getElementById('sentMessages');
    const chatPreview = document.getElementById('chatPreview');
    const chatPreviewTime = document.getElementById('chatPreviewTime');
    const timeLabel = document.getElementById('kakaoTime');
    const MESSAGE_KEY = 'tws-phone.kakaotalk.messages.v1';

    const profile = window.TWSProfile.load();
    if (!profile) {
        window.top.location.replace('../player/player.html');
        return;
    }

    if (!window.TWSProfile.isUnlocked()) {
        window.top.location.replace('../lockscreen/lockscreen.html');
        return;
    }

    window.TWSProfile.bind();

    function updateClock() {
        timeLabel.textContent = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    function showPage(name) {
        pages.forEach((page) => {
            page.classList.toggle('is-active', page.dataset.page === name);
        });

        tabButtons.forEach((button) => {
            const active = button.dataset.tab === name;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-current', active ? 'page' : 'false');
        });

        app.classList.toggle('chat-open', name === 'chat');
    }

    function formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    function readMessages() {
        try {
            const messages = JSON.parse(localStorage.getItem(MESSAGE_KEY) || '[]');
            return Array.isArray(messages)
                ? messages.filter((message) => message && typeof message.text === 'string')
                : [];
        } catch (error) {
            return [];
        }
    }

    function saveMessages(messages) {
        try {
            localStorage.setItem(MESSAGE_KEY, JSON.stringify(messages.slice(-40)));
        } catch (error) {
            console.warn('无法保存聊天消息。', error);
        }
    }

    function appendSentMessage(message, animate) {
        const row = document.createElement('div');
        row.className = 'message-row message-row--own';
        if (!animate) row.style.animation = 'none';

        const info = document.createElement('div');
        info.className = 'message__info';
        const bubble = document.createElement('p');
        bubble.className = 'message__bubble';
        bubble.textContent = message.text;
        const time = document.createElement('time');
        time.className = 'message__time';
        time.textContent = message.time;

        info.append(bubble, time);
        row.appendChild(info);
        sentMessages.appendChild(row);
    }

    const savedMessages = readMessages();
    savedMessages.forEach((message) => appendSentMessage(message, false));
    if (savedMessages.length) {
        const latest = savedMessages[savedMessages.length - 1];
        chatPreview.textContent = latest.text;
        chatPreviewTime.textContent = latest.time;
    }

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => showPage(button.dataset.tab));
    });

    openChatButtons.forEach((button) => {
        button.addEventListener('click', () => {
            showPage('chat');
            requestAnimationFrame(() => {
                conversation.scrollTop = conversation.scrollHeight;
            });
        });
    });

    backButton.addEventListener('click', () => showPage('chats'));

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        const message = { text, time: formatTime(new Date()) };
        const messages = readMessages();
        messages.push(message);
        saveMessages(messages);
        appendSentMessage(message, true);

        chatPreview.textContent = message.text;
        chatPreviewTime.textContent = message.time;
        input.value = '';
        conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
    });

    updateClock();
    setInterval(updateClock, 1000);
    showPage('chats');
}());
