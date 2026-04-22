/* ============================================
   script.js — Свадьба Раджан & Диляра
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ——————————————————————————————
       1. FADE-IN при скролле
    —————————————————————————————— */
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(
        (entries) => entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
        }),
        { threshold: 0.12 }
    );
    fadeEls.forEach(el => observer.observe(el));

    /* ——————————————————————————————
       2. ТАЙМЕР с тик-анимацией
    —————————————————————————————— */
    const eventDate = new Date('2026-08-30T18:00:00');

    function animateTick(el) {
        el.classList.remove('timer-tick');
        void el.offsetWidth; // force reflow
        el.classList.add('timer-tick');
        el.addEventListener('animationend', () => el.classList.remove('timer-tick'), { once: true });
    }

    const prevVals = { days: null, hours: null, minutes: null, seconds: null };

    function updateTimer() {
        const now = new Date();
        const diff = eventDate - now;

        if (diff <= 0) {
            ['days', 'hours', 'minutes', 'seconds'].forEach(id => document.getElementById(id).textContent = '00');
            return;
        }

        const vals = {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000)
        };

        Object.entries(vals).forEach(([id, val]) => {
            const el = document.getElementById(id);
            const str = String(val).padStart(2, '0');
            if (el && prevVals[id] !== str) {
                el.textContent = str;
                if (id === 'seconds' || id === 'minutes') animateTick(el);
                prevVals[id] = str;
            }
        });
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    /* ——————————————————————————————
       3. МУЗЫКАЛЬНЫЙ ПЛЕЕР
    —————————————————————————————— */
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('music-btn');
    const iconPlay = btn.querySelector('.icon-play-svg');
    const iconPause = btn.querySelector('.icon-pause-svg');
    const heroVideo = document.querySelector('.hero-video');

    if (heroVideo) {
        heroVideo.muted = true;
        
        // Устанавливаем скорость, когда метаданные загружены
        heroVideo.addEventListener('loadedmetadata', () => {
            heroVideo.playbackRate = 0.5;
        });

        // Попытка автозапуска
        const startVideo = () => {
            heroVideo.play().catch(() => {
                console.log("Автозапуск видео заблокирован, ждем взаимодействия.");
            });
        };

        if (heroVideo.readyState >= 1) {
            heroVideo.playbackRate = 0.5;
            startVideo();
        } else {
            heroVideo.addEventListener('loadeddata', startVideo);
        }
    }

    let isPlaying = false;

    function startMusic() {
        if (isPlaying) return;
        
        if (audio.currentTime === 0) {
            audio.currentTime = 47;
        }

        if (heroVideo && heroVideo.paused) {
            heroVideo.play();
        }

        audio.play()
            .then(() => {
                iconPlay.classList.add('hidden');
                iconPause.classList.remove('hidden');
                btn.classList.add('playing');
                isPlaying = true;
            })
            .catch(err => {
                console.log("Музыка все еще заблокирована:", err);
            });
    }

    btn.addEventListener('click', function () {
        if (isPlaying) {
            audio.pause();
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
            btn.classList.remove('playing');
            isPlaying = false;
        } else {
            startMusic();
        }
    });

    // Запуск при любом первом взаимодействии с сайтом (клик или скролл)
    const initInteraction = () => {
        startMusic();
        window.removeEventListener('click', initInteraction);
        window.removeEventListener('scroll', initInteraction);
        window.removeEventListener('touchstart', initInteraction);
    };

    window.addEventListener('click', initInteraction);
    window.addEventListener('scroll', initInteraction);
    window.addEventListener('touchstart', initInteraction);

    /* ——————————————————————————————
       4. ФОРМА RSVP
    —————————————————————————————— */
    const form = document.getElementById('rsvp-form');
    const successMsg = document.getElementById('form-success');

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const data = {
                    firstName: document.getElementById('first-name')?.value || '',
                    lastName: document.getElementById('last-name')?.value || '',
                    attendance: form.querySelector('input[name="attendance"]:checked')?.value || '',
                    persons: document.getElementById('persons')?.value || ''
                };

                const scriptURL = 'https://script.google.com/macros/s/AKfycbws2mpQyC-iu3s628x27gvzIygs8qExTJ4l_zqaHOCMH6kkCq-rhSReSWuZl-Y6suDa/exec';
                const submitBtn = form.querySelector('.btn-submit');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Отправка...';

                fetch(scriptURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: new URLSearchParams(data)
                })
                .then(() => {
                    form.classList.add('hidden');
                    successMsg.classList.remove('hidden');
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert('Произошла ошибка. Пожалуйста, попробуйте снова.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить';
                });
            });
        }

    /* ——————————————————————————————
       5. ПЛАВАЮЩИЕ ЛЕПЕСТКИ 🌸
    —————————————————————————————— */
    const PETALS = ['🌸', '🌹', '🌺', '✨', '🌷'];

    function spawnPetal() {
        const p = document.createElement('span');
        p.className = 'petal';
        p.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];
        p.style.left = (Math.random() * 98) + 'vw';
        const dur = 4 + Math.random() * 5;
        p.style.animationDuration = dur + 's';
        p.style.fontSize = (14 + Math.random() * 10) + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), (dur + 0.3) * 1000);
    }

    // Запуск: сразу 2 штуки, потом каждые 2.5 сек
    spawnPetal();
    setTimeout(spawnPetal, 800);
    setInterval(spawnPetal, 2500);
});
