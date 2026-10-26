const ekran = document.getElementById('ekran');
const kakaoTalkApp = document.getElementById('kakaoTalkApp');
const kakaoTalkFrame = document.getElementById('kakaoTalkFrame');
const openKakaoTalkButton = document.getElementById('openKakaoTalk');
const closeKakaoTalkButton = document.getElementById('closeKakaoTalk');

let iskljucen = false;

window.addEventListener('DOMContentLoaded', () => {
    ekran.style.display = 'block';
    window.TWSProfile.bind();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
        ukljuci();
    } else if (event.key === 'Escape' && !kakaoTalkApp.hidden) {
        closeKakaoTalk();
    }
});

const ukljuci = () => {
    if (iskljucen) {
        ekran.style.display = 'block';
        iskljucen = false;
    } else {
        ekran.style.display = 'none';
        iskljucen = true;
        window.TWSProfile.clearUnlocked();
        window.location.href = 'lockscreen/lockscreen.html';
    }
};

window.ukljuci = ukljuci;

const openKakaoTalk = () => {
    if (!kakaoTalkFrame.getAttribute('src')) {
        kakaoTalkFrame.src = kakaoTalkFrame.dataset.src;
    }

    kakaoTalkApp.hidden = false;
    kakaoTalkApp.setAttribute('aria-hidden', 'false');
    document.body.classList.add('app-running');
    requestAnimationFrame(() => kakaoTalkApp.classList.add('visible'));
    closeKakaoTalkButton.focus();
};

const closeKakaoTalk = () => {
    kakaoTalkApp.classList.remove('visible');
    kakaoTalkApp.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('app-running');
    setTimeout(() => {
        kakaoTalkApp.hidden = true;
        openKakaoTalkButton.focus();
    }, 260);
};

openKakaoTalkButton.addEventListener('click', openKakaoTalk);
closeKakaoTalkButton.addEventListener('click', closeKakaoTalk);

function updateClock() {
    const vreme = document.getElementById('realTime');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    vreme.textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);

ekran.addEventListener('mouseenter', () => {
    document.body.style.cursor = 'default';
});

ekran.addEventListener('mouseleave', () => {
    document.body.style.cursor = 'none';
});
