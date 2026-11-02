(function () {
    'use strict';
    const app = document.getElementById('kakaoApp');
    const pages = Array.from(document.querySelectorAll('[data-page]'));
    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    const bottomNav = document.getElementById('bottomNav');
    const timeLabel = document.getElementById('kakaoTime');
    const conversation = document.getElementById('conversation');
    const sentMessages = document.getElementById('sentMessages');
    const form = document.getElementById('messageForm');
    const input = document.getElementById('messageInput');
    const chatPreview = document.getElementById('chatPreview');
    const chatPreviewTime = document.getElementById('chatPreviewTime');
    const callSheet = document.getElementById('callSheet');
    const MESSAGE_KEY = 'tws-phone.kakaotalk.messages.v1';
    let currentTab = 'friends';

    const profile = window.TWSProfile.load();
    if (!profile) { window.top.location.replace('../player/player.html'); return; }
    if (!window.TWSProfile.isUnlocked()) { window.top.location.replace('../lockscreen/lockscreen.html'); return; }
    window.TWSProfile.bind();

    function updateClock() { timeLabel.textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); }
    function showPage(name) {
        const detail = name === 'chat' || name === 'profile';
        pages.forEach((page) => page.classList.toggle('is-active', page.dataset.page === name));
        tabs.forEach((button) => { const active = button.dataset.tab === name; button.classList.toggle('active', active); button.setAttribute('aria-current', active ? 'page' : 'false'); });
        app.classList.toggle('detail-open', detail);
        bottomNav.setAttribute('aria-hidden', String(detail));
        if (!detail) currentTab = name;
    }
    function readMessages() { try { const value = JSON.parse(localStorage.getItem(MESSAGE_KEY) || '[]'); return Array.isArray(value) ? value.filter((message) => message && typeof message.text === 'string') : []; } catch (error) { return []; } }
    function saveMessages(messages) { try { localStorage.setItem(MESSAGE_KEY, JSON.stringify(messages.slice(-40))); } catch (error) { console.warn('无法保存聊天消息。', error); } }
    function formatTime(date) { return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); }
    function appendMessage(message, animate) {
        const row = document.createElement('div'); row.className = 'message outgoing'; if (!animate) row.style.animation = 'none';
        const bubble = document.createElement('p'); const time = document.createElement('time'); bubble.textContent = message.text; time.textContent = message.time;
        row.append(bubble, time); sentMessages.appendChild(row);
    }
    function openChat() { showPage('chat'); requestAnimationFrame(() => { conversation.scrollTop = conversation.scrollHeight; }); }
    function openSheet() { callSheet.hidden = false; }
    function closeSheet() { callSheet.hidden = true; }

    const saved = readMessages();
    saved.forEach((message) => appendMessage(message, false));
    if (saved.length) { const latest = saved[saved.length - 1]; chatPreview.textContent = latest.text; chatPreviewTime.textContent = latest.time; }
    tabs.forEach((button) => button.addEventListener('click', () => showPage(button.dataset.tab)));
    document.querySelectorAll('.open-chat').forEach((button) => button.addEventListener('click', openChat));
    document.querySelectorAll('.open-profile').forEach((button) => button.addEventListener('click', () => showPage('profile')));
    document.querySelectorAll('.quick-call').forEach((button) => button.addEventListener('click', openSheet));
    document.getElementById('backToChats').addEventListener('click', () => showPage('chats'));
    document.getElementById('backFromProfile').addEventListener('click', () => showPage(currentTab));
    document.getElementById('openCallSheet').addEventListener('click', openSheet);
    document.querySelectorAll('[data-close-sheet]').forEach((button) => button.addEventListener('click', closeSheet));
    form.addEventListener('submit', (event) => {
        event.preventDefault(); const text = input.value.trim(); if (!text) return;
        const message = { text, time: formatTime(new Date()) }; const messages = readMessages(); messages.push(message); saveMessages(messages); appendMessage(message, true);
        chatPreview.textContent = message.text; chatPreviewTime.textContent = message.time; input.value = ''; conversation.scrollTo({ top: conversation.scrollHeight, behavior: 'smooth' });
    });
    updateClock(); setInterval(updateClock, 1000); showPage('friends');
}());
