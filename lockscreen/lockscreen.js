const ekran = document.getElementById('ekran');
const izadjiLinija = document.getElementById('izadjiLinija');
const telefon = document.getElementById('telefon');
const passcodeScreen = document.getElementById('passcodeScreen');
const passcodeDots = document.getElementById('passcodeDots');
const passcodeMessage = document.getElementById('passcodeMessage');
const deleteKey = document.getElementById('deleteKey');

if (!window.TWSProfile.load()) {
    window.location.replace('../player/player.html');
}
window.TWSProfile.clearUnlocked();

const PASSCODE = '0130';
const UGASEN_EKRAN = 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), rgba(0,0,0,0) 40%), linear-gradient(135deg, #050505, #0b0b0b, #020202)';

let iskljucen = true;
let passcodeOtvoren = false;
let uneseneCifre = '';
let otkljucavanje = false;
let pocetniY = null;
let proveraUToku = false;

telefon.style.background = UGASEN_EKRAN;
ekran.style.display = 'none';

const osveziTacke = () => {
    const tacke = passcodeDots.querySelectorAll('.passcode-dot');

    tacke.forEach((tacka, index) => {
        tacka.classList.toggle('filled', index < uneseneCifre.length);
    });

    passcodeDots.setAttribute('aria-label', `已输入 ${uneseneCifre.length} 位，共 4 位`);
    deleteKey.textContent = uneseneCifre.length > 0 ? '删除' : '取消';
};

const resetujSifru = () => {
    uneseneCifre = '';
    proveraUToku = false;
    passcodeMessage.textContent = '';
    passcodeDots.classList.remove('shake');
    osveziTacke();
};

const zatvoriSifru = () => {
    passcodeOtvoren = false;
    passcodeScreen.classList.remove('visible', 'unlocking');
    passcodeScreen.setAttribute('aria-hidden', 'true');
    ekran.classList.remove('passcode-active');
    resetujSifru();
};

const zavrsiOtkljucavanje = () => {
    if (otkljucavanje) return;

    otkljucavanje = true;
    passcodeMessage.textContent = '正在解锁…';
    passcodeScreen.classList.add('unlocking');

    setTimeout(() => {
        ekran.style.animation = 'lockscreenUp 0.5s forwards';
    }, 180);

    setTimeout(() => {
        window.TWSProfile.markUnlocked();
        window.location.href = '../index.html';
    }, 620);
};

const prikaziGresku = () => {
    proveraUToku = true;
    passcodeMessage.textContent = '密码错误，请重试';
    passcodeDots.classList.remove('shake');
    void passcodeDots.offsetWidth;
    passcodeDots.classList.add('shake');

    setTimeout(() => {
        uneseneCifre = '';
        proveraUToku = false;
        passcodeDots.classList.remove('shake');
        osveziTacke();
    }, 520);
};

const proveriSifru = () => {
    if (uneseneCifre === PASSCODE) {
        zavrsiOtkljucavanje();
    } else {
        prikaziGresku();
    }
};

const unesiCifru = (cifra) => {
    if (!passcodeOtvoren || proveraUToku || otkljucavanje || uneseneCifre.length >= PASSCODE.length) return;

    uneseneCifre += cifra;
    passcodeMessage.textContent = '';
    osveziTacke();

    if (uneseneCifre.length === PASSCODE.length) {
        proveraUToku = true;
        setTimeout(proveriSifru, 160);
    }
};

const obrisiCifruIliOtkazi = () => {
    if (proveraUToku || otkljucavanje) return;

    if (uneseneCifre.length === 0) {
        zatvoriSifru();
        return;
    }

    uneseneCifre = uneseneCifre.slice(0, -1);
    passcodeMessage.textContent = '';
    osveziTacke();
};

const otvoriSifru = () => {
    if (iskljucen || passcodeOtvoren || otkljucavanje) return;

    passcodeOtvoren = true;
    resetujSifru();
    ekran.classList.add('passcode-active');
    passcodeScreen.classList.add('visible');
    passcodeScreen.setAttribute('aria-hidden', 'false');
};

const ukljuci = () => {
    if (iskljucen) {
        ekran.style.animation = 'fadeBlur 1s ease forwards';
        ekran.style.display = 'block';
        iskljucen = false;
        telefon.style.background = '';
        return;
    }

    zatvoriSifru();
    ekran.style.display = 'none';
    iskljucen = true;
    telefon.style.background = UGASEN_EKRAN;
};

window.ukljuci = ukljuci;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
        ukljuci();
        return;
    }

    if (iskljucen) return;

    if (passcodeOtvoren) {
        if (/^[0-9]$/.test(event.key)) {
            unesiCifru(event.key);
        } else if (event.key === 'Backspace') {
            obrisiCifruIliOtkazi();
        } else if (event.key === 'Escape') {
            zatvoriSifru();
        }
        return;
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault();
        otvoriSifru();
    }
});

passcodeScreen.addEventListener('click', (event) => {
    const taster = event.target.closest('button');
    if (!taster) return;

    if (taster.dataset.digit !== undefined) {
        unesiCifru(taster.dataset.digit);
        return;
    }

    if (taster.dataset.action === 'delete') {
        obrisiCifruIliOtkazi();
    } else if (taster.dataset.action === 'emergency') {
        passcodeMessage.textContent = '演示界面未连接紧急呼叫';
    }
});

function updateClock() {
    const vreme = document.getElementById('vreme');
    const datum = document.getElementById('datum');
    const now = new Date();

    vreme.textContent = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    datum.textContent = new Intl.DateTimeFormat('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    }).format(now);
}

updateClock();
setInterval(updateClock, 1000);

ekran.addEventListener('mouseenter', () => {
    document.body.style.cursor = 'default';
});

ekran.addEventListener('mouseleave', () => {
    document.body.style.cursor = 'none';
});

izadjiLinija.addEventListener('click', () => {
    otvoriSifru();
});

ekran.addEventListener('pointerdown', (event) => {
    if (passcodeOtvoren) return;
    pocetniY = event.clientY;
});

ekran.addEventListener('pointerup', (event) => {
    if (!passcodeOtvoren && pocetniY !== null && pocetniY - event.clientY > 60) {
        otvoriSifru();
    }

    pocetniY = null;
});

ekran.addEventListener('pointercancel', () => {
    pocetniY = null;
});

if (new URLSearchParams(window.location.search).get('wake') === '1') {
    window.history.replaceState({}, '', window.location.pathname);
    ukljuci();
}
