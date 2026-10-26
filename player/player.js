(function () {
    'use strict';

    const form = document.getElementById('profileForm');
    const nameInput = document.getElementById('playerName');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const chooseAvatar = document.getElementById('chooseAvatar');
    const message = document.getElementById('formMessage');
    const continueButton = document.getElementById('continueButton');
    const time = document.getElementById('setupTime');

    const existingProfile = window.TWSProfile.load();
    let avatarData = existingProfile ? existingProfile.avatar : '';

    avatarPreview.src = avatarData || window.TWSProfile.FALLBACK_AVATAR;
    if (existingProfile) {
        nameInput.value = existingProfile.name;
        continueButton.textContent = '保存资料并进入锁屏';
    }

    function updateTime() {
        time.textContent = new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    function cropAvatar(file) {
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();

            image.onload = () => {
                const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
                const sourceX = (image.naturalWidth - sourceSize) / 2;
                const sourceY = (image.naturalHeight - sourceSize) / 2;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = 512;
                canvas.height = 512;
                context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, 512, 512);
                URL.revokeObjectURL(objectUrl);
                resolve(canvas.toDataURL('image/jpeg', 0.86));
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('无法读取这张图片，请换一张 JPG、PNG 或 WebP 图片'));
            };

            image.src = objectUrl;
        });
    }

    chooseAvatar.addEventListener('click', () => avatarInput.click());

    avatarInput.addEventListener('change', async () => {
        const file = avatarInput.files && avatarInput.files[0];
        if (!file) return;

        message.textContent = '';
        chooseAvatar.disabled = true;
        chooseAvatar.textContent = '正在处理…';

        try {
            avatarData = await cropAvatar(file);
            avatarPreview.src = avatarData;
            chooseAvatar.textContent = '重新选择';
        } catch (error) {
            message.textContent = error.message;
            chooseAvatar.textContent = '选择头像';
        } finally {
            chooseAvatar.disabled = false;
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        message.textContent = '';

        const name = nameInput.value.trim();
        if (!name) {
            message.textContent = '请先输入你的名字。';
            nameInput.focus();
            return;
        }

        if (!avatarData) {
            message.textContent = '请先选择一张头像。';
            chooseAvatar.focus();
            return;
        }

        continueButton.disabled = true;
        continueButton.textContent = '正在保存…';

        try {
            window.TWSProfile.save({ name, avatar: avatarData });
            window.TWSProfile.clearUnlocked();
            window.location.href = '../lockscreen/lockscreen.html?wake=1';
        } catch (error) {
            message.textContent = error.name === 'QuotaExceededError'
                ? '头像文件仍然太大，请换一张图片后重试。'
                : (error.message || '保存失败，请重试。');
            continueButton.disabled = false;
            continueButton.textContent = '保存并进入锁屏';
        }
    });

    updateTime();
    setInterval(updateTime, 1000);
}());
