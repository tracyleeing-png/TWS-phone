(function () {
    'use strict';
    const form = document.getElementById('profileForm');
    const input = document.getElementById('playerName');
    const button = document.getElementById('continueButton');
    const message = document.getElementById('formMessage');
    const existing = window.TWSProfile.load();
    if (existing) input.value = existing.name;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = input.value.trim();
        if (!name) {
            message.textContent = '请输入你的名字。';
            input.focus();
            return;
        }
        button.disabled = true;
        try {
            const avatar = existing && existing.avatar ? existing.avatar : window.TWSProfile.FALLBACK_AVATAR;
            window.TWSProfile.save({ name, avatar });
            const engine = window.TWSGame.engine();
            const state = engine.reload();
            if (!state || !state.events || !state.events.length) engine.start(name, true);
            else {
                state.playerName = name;
                engine.store.save();
            }
            window.TWSProfile.markUnlocked();
            window.location.replace('../index.html');
        } catch (error) {
            message.textContent = error.message || '保存失败，请重试。';
            button.disabled = false;
        }
    });
}());
