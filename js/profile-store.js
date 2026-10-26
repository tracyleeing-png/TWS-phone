(function () {
    'use strict';

    const STORAGE_KEY = 'tws-phone.player-profile.v1';
    const UNLOCKED_KEY = 'tws-phone.unlocked';
    const FALLBACK_AVATAR = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffe37b"/><stop offset="1" stop-color="#f5b942"/></linearGradient></defs>' +
        '<rect width="256" height="256" rx="128" fill="url(#g)"/>' +
        '<circle cx="128" cy="102" r="48" fill="#fff" fill-opacity=".9"/>' +
        '<path d="M45 230c8-48 38-75 83-75s75 27 83 75" fill="#fff" fill-opacity=".9"/>' +
        '</svg>'
    );

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;

            const profile = JSON.parse(raw);
            if (!profile || typeof profile.name !== 'string' || typeof profile.avatar !== 'string') {
                return null;
            }

            const name = profile.name.trim();
            if (!name || !profile.avatar) return null;

            return {
                name,
                avatar: profile.avatar,
                updatedAt: profile.updatedAt || null
            };
        } catch (error) {
            console.warn('无法读取玩家资料。', error);
            return null;
        }
    }

    function save(profile) {
        const name = String(profile && profile.name ? profile.name : '').trim();
        const avatar = String(profile && profile.avatar ? profile.avatar : '');

        if (!name || !avatar) {
            throw new Error('请填写名字并选择头像');
        }

        const nextProfile = {
            name: name.slice(0, 20),
            avatar,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
        return nextProfile;
    }

    function bind(root) {
        const profile = load();
        if (!profile) return null;

        const scope = root || document;
        scope.querySelectorAll('[data-player-name]').forEach((element) => {
            element.textContent = profile.name;
        });
        scope.querySelectorAll('[data-player-avatar]').forEach((image) => {
            image.src = profile.avatar;
            image.alt = `${profile.name}的头像`;
        });

        return profile;
    }

    function markUnlocked() {
        sessionStorage.setItem(UNLOCKED_KEY, '1');
    }

    function clearUnlocked() {
        sessionStorage.removeItem(UNLOCKED_KEY);
    }

    function isUnlocked() {
        return sessionStorage.getItem(UNLOCKED_KEY) === '1';
    }

    window.TWSProfile = {
        STORAGE_KEY,
        UNLOCKED_KEY,
        FALLBACK_AVATAR,
        load,
        save,
        bind,
        markUnlocked,
        clearUnlocked,
        isUnlocked
    };
}());
