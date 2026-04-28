/* ============================================
   script_kz.js — Үйлену тойы Раджан & Диляра
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
        void el.offsetWidth;
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
       3. ВИДЕО — запуск без звука
    —————————————————————————————— */
    const heroVideo = document.querySelector('.hero-video');

    if (heroVideo) {
        heroVideo.muted = true;

        heroVideo.addEventListener('loadedmetadata', () => {
            heroVideo.playbackRate = 0.5;
        });

        const startVideo = () => {
            heroVideo.play().catch(() => {
                console.log('Автозапуск видео заблокирован.');
            });
        };

        if (heroVideo.readyState >= 1) {
            heroVideo.playbackRate = 0.5;
            startVideo();
        } else {
            heroVideo.addEventListener('loadeddata', startVideo);
        }
    }

    /* ——————————————————————————————
       4. МУЗЫКАЛЬНЫЙ ПЛЕЕР
    —————————————————————————————— */
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('music-btn');
    const iconPlay = btn.querySelector('.icon-play-svg');
    const iconPause = btn.querySelector('.icon-pause-svg');

    let isPlaying = false;

    function startMusic() {
        if (isPlaying) return;

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
                console.log('Музыка заблокирована:', err);
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

    /* ——————————————————————————————
       5. AUTO SCROLL DOWN
    —————————————————————————————— */
    let autoScrollActive = false;
    let scrollStarted = false;
    const scrollSpeed = 0.5;

    function step() {
        if (!autoScrollActive) return;

        window.scrollBy(0, scrollSpeed);

        const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        const totalHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

        if ((window.innerHeight + scrollPos) >= totalHeight - 5) {
            autoScrollActive = false;
        } else {
            requestAnimationFrame(step);
        }
    }

    const stopScroll = () => {
        if (autoScrollActive) {
            autoScrollActive = false;
        }
    };
    window.addEventListener('wheel', stopScroll, { passive: true });
    window.addEventListener('touchmove', stopScroll, { passive: true });
    window.addEventListener('mousedown', stopScroll);

    /* ——————————————————————————————
       6. ЗАСТАВКА «БАСЫҢЫЗ БАСТАУ ҮШІН»
    —————————————————————————————— */
    const splash = document.getElementById('splash-screen');

    if (splash) {
        splash.addEventListener('click', function () {
            startMusic();

            if (!scrollStarted) {
                scrollStarted = true;
                autoScrollActive = true;
                requestAnimationFrame(step);
            }

            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 600);
        });
    }

    /* ——————————————————————————————
       7. ФОРМА RSVP
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
            submitBtn.textContent = 'Жіберілуде...';

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
                alert('Қате орын алды. Қайтадан байқап көріңіз.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Жіберу';
            });
        });
    }

    /* ——————————————————————————————
       8. ПЛАВАЮЩИЕ ЛЕПЕСТКИ 🌸
    —————————————————————————————— */
    const PETALS = ['🌸', '🌹', '🌺', '✨', '🌷', '💕', '❤️', '💗', '💍'];

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

    spawnPetal();
    setTimeout(spawnPetal, 800);
    setInterval(spawnPetal, 2500);

    /* ——————————————————————————————
       9. DRESSCODE COLOR PICKER & AUTO-CHANGE
    —————————————————————————————— */
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const dressFills = document.querySelectorAll('.dresscode-fill');
    const autoColors = ['#D6CCBC', '#5E3A2C'];

    if (colorSwatches.length > 0) {
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                const color = swatch.style.backgroundColor;
                dressFills.forEach(el => {
                    el.style.fill = color;
                });
            });
        });

        setInterval(() => {
            const color1 = autoColors[Math.floor(Math.random() * autoColors.length)];
            const color2 = autoColors[Math.floor(Math.random() * autoColors.length)];

            dressFills.forEach((el, i) => {
                el.style.transition = 'fill 1s ease';
                if (i < 5) {
                    el.style.fill = color1;
                } else {
                    el.style.fill = color2;
                }
            });
        }, 2000);
    }
});
