(function () {
    'use strict';
    const app = document.getElementById('kakaoApp');
    const pages = Array.from(document.querySelectorAll('[data-page]'));
    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    const engine = window.TWSGame.engine();
    const story = window.TWSGameData;
    const conversation = document.getElementById('conversation');
    const choiceTray = document.getElementById('choiceTray');
    let currentPage = 'chats';
    let currentThread = null;
    let lastSignature = '';

    const senderNames = { friendA: '好友A', classmateA: '同学A', jin: '金道勋', memberB: '组员B', memberC: '组员C', memberD: '组员D', system: 'KakaoTalk' };

    function escapeHTML(value) {
        return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
    }

    function avatar(threadId, small) {
        const thread = story.threads[threadId] || {};
        if (threadId === 'jin') return `<img class="story-avatar ${small ? 'small' : ''}" src="../img/jin-dohun-avatar.jpg" alt="金道勋头像">`;
        const labels = { friendA: '友', classmateA: '同', group3: '3组', friendRequest: '+' };
        return `<span class="story-avatar generated ${threadId} ${small ? 'small' : ''}">${labels[threadId] || '聊'}</span>`;
    }

    function threadMessages(threadId) {
        return engine.state.messages.filter((message) => message.threadId === threadId);
    }

    function messagePreview(message) {
        if (!message) return '暂无消息';
        if (message.type === 'file') return `[文件] ${message.fileName}`;
        if (message.type === 'photo') return '[图片]';
        return message.translation || message.text;
    }

    function availableThreads() {
        const ids = ['friendA', 'classmateA', 'group3'];
        if (engine.state.friendRequestAccepted || threadMessages('jin').length) ids.push('jin');
        return ids.filter((id) => threadMessages(id).length).sort((a, b) => {
            const ma = threadMessages(a).slice(-1)[0]; const mb = threadMessages(b).slice(-1)[0];
            return `${mb.date}T${mb.time}`.localeCompare(`${ma.date}T${ma.time}`);
        });
    }

    function renderFriendRequest() {
        const node = engine.node('CH01-005');
        const event = engine.event('CH01-005');
        if (!event || engine.state.friendRequestAccepted || !engine.state.activeNodes.includes('CH01-005')) return '';
        return `<article class="request-card"><div>${avatar('jin', true)}<span><strong>金道勋</strong><small>因课程资料发送好友申请</small></span></div><div class="request-actions">${node.playerChoices.filter((choice) => choice.id === 'accept' || event.status !== 'deferred').map((choice) => `<button data-node="CH01-005" data-choice="${choice.id}" class="${choice.id === 'accept' ? 'primary' : ''}">${escapeHTML(choice.label || choice.text)}</button>`).join('')}${event.status === 'deferred' ? '<span>申请已保留，可随时接受</span>' : ''}</div></article>`;
    }

    function renderThreads() {
        const list = document.getElementById('threadList');
        const rows = availableThreads().map((threadId) => {
            const thread = story.threads[threadId];
            const messages = threadMessages(threadId);
            const latest = messages[messages.length - 1];
            const unread = Number(engine.state.unreadByThread[threadId] || 0);
            return `<button class="chat-list-row story-thread" data-thread="${threadId}">${avatar(threadId)}<span><strong>${escapeHTML(thread.name)}</strong><small>${escapeHTML(messagePreview(latest))}</small></span><time>${latest.time}</time>${unread ? `<b class="unread-badge">${unread}</b>` : ''}</button>`;
        }).join('');
        list.innerHTML = renderFriendRequest() + rows + (!rows ? '<p class="empty-list">还没有聊天</p>' : '');
        list.querySelectorAll('[data-thread]').forEach((button) => button.addEventListener('click', () => openThread(button.dataset.thread)));
        bindChoices(list);
    }

    function renderFriends() {
        const friends = document.getElementById('friendsList');
        const accepted = engine.state.friendRequestAccepted;
        friends.innerHTML = `<a class="self-card" href="../player/player.html?edit=1" target="_top"><img data-player-avatar src="" alt="玩家头像"><strong data-player-name>玩家</strong><span>Profile +</span></a><section class="friend-section"><div class="section-label"><span>好友 ${accepted ? 1 : 0}</span><b>⌃</b></div>${accepted ? `<button class="person-row" data-thread="jin">${avatar('jin', true)}<strong>金道勋</strong></button>` : '<p class="empty-friend">尚未添加新好友</p>'}</section>${renderFriendRequest()}`;
        window.TWSProfile.bind(friends);
        friends.querySelectorAll('[data-thread]').forEach((button) => button.addEventListener('click', () => openThread(button.dataset.thread)));
        bindChoices(friends);
    }

    function renderCalls() {
        document.getElementById('callList').innerHTML = engine.state.friendRequestAccepted ? `<div class="call-row"><button data-thread="jin">${avatar('jin')}<span><strong>金道勋</strong><small>尚无通话记录</small></span></button><div><button class="quick-call" aria-label="语音通话"><svg><use href="#i-phone"/></svg></button></div></div>` : '<p class="empty-list">添加好友后可以使用通话功能</p>';
    }

    function renderMore() {
        document.getElementById('chapterLabel').textContent = engine.state.chapterLabel;
        document.getElementById('storyDate').textContent = engine.state.gameDate.replace('2026-10-26', '2026年10月26日').replace('2026-10-27', '2026年10月27日');
        window.TWSProfile.bind();
    }

    function messageStatus(message, messages, index) {
        if (message.sender !== 'player') return '';
        const hasReply = messages.slice(index + 1).some((item) => item.sender !== 'player');
        return hasReply ? '已读' : '已发送';
    }

    function messageHTML(message, messages, index) {
        const own = message.sender === 'player';
        const author = senderNames[message.sender] || senderNames.jin;
        let body = '';
        if (message.type === 'photo') body = '<div class="story-photo hotpot"><span>🍲</span><small>火锅照片</small></div>';
        else if (message.type === 'file') body = `<div class="file-bubble"><span>PDF</span><div><strong>${escapeHTML(message.fileName || message.text)}</strong><small>${escapeHTML(message.translation || '课程文件')}</small></div></div>`;
        else body = `<p class="message__bubble"><span>${escapeHTML(message.text)}</span>${message.translation ? `<small>${escapeHTML(message.translation)}</small>` : ''}</p>`;
        if (own) return `<div class="message outgoing"><div class="message-side"><small>${messageStatus(message, messages, index)}</small><time>${message.time}</time></div>${body}</div>`;
        const avatarThread = message.sender === 'jin' ? 'jin' : message.threadId;
        return `<div class="message incoming">${avatar(avatarThread, true)}<div class="incoming-content"><strong>${escapeHTML(author)}</strong><div class="incoming-line">${body}<time>${message.time}</time></div></div></div>`;
    }

    function renderChoices(threadId) {
        const active = engine.activeNodesForThread(threadId);
        if (!active.length) {
            choiceTray.innerHTML = '<p class="waiting-copy">等待新的消息…</p>';
            choiceTray.classList.add('is-empty');
            return;
        }
        choiceTray.classList.remove('is-empty');
        choiceTray.innerHTML = active.map((node) => {
            const event = engine.event(node.id);
            const choices = (node.playerChoices || []).filter((choice) => !(event && event.status === 'deferred' && choice.defer));
            return `<div class="choice-group"><span>${event && event.status === 'deferred' ? `${node.availableFrom.slice(11,16)} 待回复` : '选择要发送的消息'}</span>${choices.map((choice) => `<button data-node="${node.id}" data-choice="${choice.id}"><strong>${escapeHTML(choice.label || choice.text)}</strong>${choice.translation ? `<small>${escapeHTML(choice.translation)}</small>` : ''}</button>`).join('')}</div>`;
        }).join('');
        bindChoices(choiceTray);
    }

    function renderConversation() {
        if (!currentThread) return;
        const thread = story.threads[currentThread];
        const messages = threadMessages(currentThread);
        document.getElementById('chatTitle').textContent = thread.name;
        document.getElementById('chatSubtitle').textContent = thread.subtitle || '';
        conversation.innerHTML = `<div class="date-pill">2026年10月26日 星期一</div>${messages.map((message, index) => messageHTML(message, messages, index)).join('')}`;
        renderChoices(currentThread);
        requestAnimationFrame(() => { conversation.scrollTop = conversation.scrollHeight; });
    }

    function bindChoices(root) {
        root.querySelectorAll('[data-node][data-choice]').forEach((button) => button.addEventListener('click', () => {
            button.disabled = true;
            try {
                engine.choose(button.dataset.node, button.dataset.choice);
                window.parent.postMessage({ type: 'tws-game-updated' }, window.location.origin);
                renderAll(true);
            } catch (error) {
                button.disabled = false;
                console.warn(error.message);
            }
        }));
    }

    function showPage(name) {
        currentPage = name;
        const detail = name === 'chat';
        pages.forEach((page) => page.classList.toggle('is-active', page.dataset.page === name));
        tabs.forEach((button) => { const active = button.dataset.tab === name; button.classList.toggle('active', active); button.setAttribute('aria-current', active ? 'page' : 'false'); });
        app.classList.toggle('detail-open', detail);
        if (!detail) currentThread = null;
    }

    function openThread(threadId) {
        currentThread = threadId;
        engine.markThreadRead(threadId);
        showPage('chat');
        renderConversation();
    }

    function renderChapterOverlay() {
        const overlay = document.getElementById('chapterOverlay');
        if (engine.state.chapter === 2) {
            overlay.hidden = false;
            document.getElementById('chapterEndLabel').textContent = '第二章';
            document.getElementById('nextChapterButton').textContent = '第二章内容正在开发';
            document.getElementById('nextChapterButton').disabled = true;
        } else overlay.hidden = !engine.state.chapterCompleted;
    }

    function renderAll(force) {
        engine.reload();
        const signature = `${engine.state.updatedAt}:${currentPage}:${currentThread || ''}`;
        if (!force && signature === lastSignature) return;
        lastSignature = signature;
        document.getElementById('kakaoTime').textContent = engine.state.gameTime;
        renderThreads(); renderFriends(); renderCalls(); renderMore();
        if (currentThread) renderConversation();
        renderChapterOverlay();
    }

    tabs.forEach((button) => button.addEventListener('click', () => { showPage(button.dataset.tab); renderAll(true); }));
    document.getElementById('backToChats').addEventListener('click', () => { showPage('chats'); renderAll(true); });
    document.getElementById('nextChapterButton').addEventListener('click', () => { if (engine.enterChapterTwo()) renderAll(true); });
    window.addEventListener('storage', (event) => { if (event.key === window.TWSGame.SAVE_KEY) renderAll(true); });

    engine.start(window.TWSProfile.load().name, false);
    showPage('chats');
    renderAll(true);
    setInterval(() => { const delivered = engine.runScheduler(false); if (delivered.length) { window.parent.postMessage({ type: 'tws-game-updated' }, window.location.origin); renderAll(true); } }, 400);
}());
