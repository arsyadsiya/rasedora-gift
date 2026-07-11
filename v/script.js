/* ============================================
   DARK GREEN ROMANTIC WEBSITE - MAIN SCRIPT
   ============================================ */

(function() {
    'use strict';

    // ==========================================
    // KONFIGURASI - GANTI DI SINI
    // ==========================================
    
    // GANTI PIN DI SINI
    const SECRET_PIN = "1234";
    
    // DAFTAR LAGU - LETAKKAN DI assets/audio/
    const PLAYLIST = [
        { title: 'Song 1 - Adella', src: 'assets/audio/song1.mp3' },
        { title: 'Song 2 - Monata', src: 'assets/audio/song2.mp3' },
        { title: 'Song 3 - Simpatik', src: 'assets/audio/song3.mp3' },
        { title: 'Song 4 - Sagita', src: 'assets/audio/song4.mp3' }
    ];

    // ==========================================
    // PIN SCREEN LOGIC
    // ==========================================
    const pinScreen = document.getElementById('pinScreen');
    const mainContent = document.getElementById('mainContent');
    const pinDots = document.querySelectorAll('.pin-dot');
    const pinError = document.getElementById('pinError');
    const pinContainer = document.querySelector('.pin-container');
    let currentPin = '';

    function updatePinDots() {
        pinDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < currentPin.length);
        });
    }

    function handlePinInput(key) {
        if (key === 'clear') {
            currentPin = currentPin.slice(0, -1);
        } else if (currentPin.length < 4) {
            currentPin += key;
        }
        
        updatePinDots();
        pinError.classList.remove('show');
        
        if (currentPin.length === 4) {
            setTimeout(checkPin, 200);
        }
    }

    function checkPin() {
        if (currentPin === SECRET_PIN) {
            unlockScreen();
        } else {
            pinError.classList.add('show');
            pinContainer.classList.add('shake');
            setTimeout(() => {
                currentPin = '';
                updatePinDots();
                pinContainer.classList.remove('shake');
            }, 600);
        }
    }

    function unlockScreen() {
        pinScreen.classList.add('unlocked');
        setTimeout(() => {
            pinScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            initMainFeatures();
        }, 800);
    }

    // Numpad event listeners
    document.querySelectorAll('.pin-key').forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.dataset.key;
            if (keyValue && !key.classList.contains('pin-key-empty')) {
                handlePinInput(keyValue);
            }
        });
    });

    // ==========================================
    // MAIN FEATURES (After PIN Unlock)
    // ==========================================
    function initMainFeatures() {
        initMusicPlayer();
        initScrollReveal();
        initTypewriter();
        initLightbox();
        initFloatingMenu();
        initSurprise();
        initFallingPetals();
        initTouchEffects();
        initHeroParticles();
    }

    // ==========================================
    // MUSIC PLAYER
    // ==========================================
    function initMusicPlayer() {
        const audio = new Audio();
        audio.preload = 'metadata';
        let currentTrack = 0;
        let isPlaying = false;

        const btnPlay = document.getElementById('btnPlay');
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');
        const musicTitle = document.getElementById('musicTitle');
        const musicProgress = document.getElementById('musicProgress');

        function loadTrack(index) {
            currentTrack = (index + PLAYLIST.length) % PLAYLIST.length;
            audio.src = PLAYLIST[currentTrack].src;
            musicTitle.textContent = PLAYLIST[currentTrack].title;
        }

        function togglePlay() {
            if (isPlaying) {
                audio.pause();
                btnPlay.textContent = '▶';
            } else {
                audio.play().catch(err => console.log('Audio play failed:', err));
                btnPlay.textContent = '⏸';
            }
            isPlaying = !isPlaying;
        }

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                musicProgress.style.width = progress + '%';
            }
        });

        audio.addEventListener('ended', () => {
            loadTrack(currentTrack + 1);
            audio.play();
        });

        btnPlay.addEventListener('click', togglePlay);
        btnPrev.addEventListener('click', () => {
            loadTrack(currentTrack - 1);
            if (isPlaying) audio.play();
        });
        btnNext.addEventListener('click', () => {
            loadTrack(currentTrack + 1);
            if (isPlaying) audio.play();
        });

        loadTrack(0);
    }

    // ==========================================
    // SCROLL REVEAL (Intersection Observer)
    // ==========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // TYPEWRITER EFFECT
    // ==========================================
    function initTypewriter() {
        const letterSection = document.getElementById('letter');
        const lines = document.querySelectorAll('.typewriter-line, .typewriter-sign, .typewriter-name');
        let started = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !started) {
                    started = true;
                    startTypewriter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(letterSection);

        async function startTypewriter() {
            for (const line of lines) {
                await typeLine(line);
                await wait(300);
            }
        }

        function typeLine(element) {
            return new Promise((resolve) => {
                const text = element.dataset.text;
                let index = 0;
                element.textContent = '';
                
                const interval = setInterval(() => {
                    element.textContent += text[index];
                    index++;
                    if (index >= text.length) {
                        clearInterval(interval);
                        element.classList.add('done');
                        resolve();
                    }
                }, 40);
            });
        }

        function wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // ==========================================
    // LIGHTBOX (Album)
    // ==========================================
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxClose = document.getElementById('lightboxClose');
        const albumItems = document.querySelectorAll('.album-item');

        albumItems.forEach(item => {
            item.addEventListener('click', () => {
                const src = item.dataset.src;
                lightboxImg.src = src;
                lightbox.classList.remove('hidden');
            });
        });

        function closeLightbox() {
            lightbox.classList.add('hidden');
            lightboxImg.src = '';
        }

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // ==========================================
    // FLOATING MENU
    // ==========================================
    function initFloatingMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const menuItems = document.getElementById('menuItems');

        menuToggle.addEventListener('click', () => {
            menuItems.classList.toggle('hidden');
        });

        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                menuItems.classList.add('hidden');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-menu')) {
                menuItems.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // SURPRISE BUTTON
    // ==========================================
    function initSurprise() {
        const surpriseBtn = document.getElementById('surpriseBtn');
        const surpriseMessage = document.getElementById('surpriseMessage');

        surpriseBtn.addEventListener('click', () => {
            surpriseMessage.classList.remove('hidden');
            // Trigger extra hearts
            for (let i = 0; i < 10; i++) {
                setTimeout(() => createHeart(
                    window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                    window.innerHeight / 2
                ), i * 100);
            }
        });
    }

    // ==========================================
    // FALLING PETALS
    // ==========================================
    function initFallingPetals() {
        const container = document.getElementById('fallingPetals');
        const petals = ['💚', '🌿', '✨', '🌸'];
        
        function createPetal() {
            const petal = document.createElement('span');
            petal.className = 'petal';
            petal.textContent = petals[Math.floor(Math.random() * petals.length)];
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.animationDuration = (Math.random() * 5 + 8) + 's';
            petal.style.fontSize = (Math.random() * 10 + 14) + 'px';
            petal.style.opacity = Math.random() * 0.5 + 0.3;
            container.appendChild(petal);
            
            setTimeout(() => petal.remove(), 13000);
        }

        // Create petals periodically
        setInterval(createPetal, 1500);
        
        // Initial batch
        for (let i = 0; i < 5; i++) {
            setTimeout(createPetal, i * 300);
        }
    }

    // ==========================================
    // TOUCH EFFECTS (Sparkle, Hearts, Glow)
    // ==========================================
    function initTouchEffects() {
        const container = document.getElementById('touchEffects');
        let lastTouch = 0;

        function handleInteraction(x, y) {
            const now = Date.now();
            if (now - lastTouch < 100) return; // Throttle
            lastTouch = now;

            // Create sparkles
            for (let i = 0; i < 5; i++) {
                createSparkle(x, y);
            }
            
            // Occasionally create heart
            if (Math.random() > 0.6) {
                createHeart(x, y);
            }
            
            // Glow burst
            createGlowBurst(x, y);
        }

        function createSparkle(x, y) {
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';
            sparkle.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
            sparkle.style.top = (y + (Math.random() - 0.5) * 40) + 'px';
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 800);
        }

        function createHeart(x, y) {
            const heart = document.createElement('span');
            heart.className = 'heart-float';
            heart.textContent = '💚';
            heart.style.left = x + 'px';
            heart.style.top = y + 'px';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 2000);
        }

        function createGlowBurst(x, y) {
            const burst = document.createElement('span');
            burst.className = 'glow-burst';
            burst.style.left = (x - 20) + 'px';
            burst.style.top = (y - 20) + 'px';
            container.appendChild(burst);
            setTimeout(() => burst.remove(), 600);
        }

        // Touch events
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            handleInteraction(touch.clientX, touch.clientY);
        }, { passive: true });

        // Mouse events (for desktop testing)
        document.addEventListener('click', (e) => {
            handleInteraction(e.clientX, e.clientY);
        });
    }

    // ==========================================
    // HERO PARTICLES (Canvas - Fireflies)
    // ==========================================
    function initHeroParticles() {
        const canvas = document.getElementById('heroParticles');
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(40, Math.floor(canvas.width / 25));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.5 + 0.3,
                    opacitySpeed: Math.random() * 0.01 + 0.005
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.opacity += p.opacitySpeed;
                
                if (p.opacity > 0.8 || p.opacity < 0.2) {
                    p.opacitySpeed = -p.opacitySpeed;
                }
                
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                
                // Draw particle with glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                gradient.addColorStop(0, `rgba(110, 231, 183, ${p.opacity})`);
                gradient.addColorStop(1, 'rgba(110, 231, 183, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Core
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            animationId = requestAnimationFrame(animate);
        }

        // Only animate when hero is visible
        const hero = document.getElementById('hero');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animate();
                } else {
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                }
            });
        }, { threshold: 0.1 });

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });

        resize();
        createParticles();
        observer.observe(hero);
    }

    // ==========================================
    // SMOOTH SCROLL for anchor links
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

})();