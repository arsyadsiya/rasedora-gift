/* ============================================================
   LOVE SCRAPBOOK V4 — INTERACTIVE ENGINE
   ============================================================ */

(function(){
  'use strict';

  // =========================
  // STATE
  // =========================
  const state = {
    pin: '',
    pinExpected: DATA.pin,
    currentPage: 0,
    pages: [],
    soundOn: true,
    stickerFound: 0,
    heartsFound: 0,
    memFlip: null,
    memLock: false,
    memMatched: 0,
    wheelSpinning: false,
    audioCtx: null,
    bgmPlaying: false,
    letterTyped: false
  };

  // =========================
  // UTILS
  // =========================
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => [...el.querySelectorAll(s)];

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  // =========================
  // AUDIO (Web Audio API - lightweight)
  // =========================
  function initAudio(){
    if(state.audioCtx) return;
    try{
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }catch(e){}
  }

  function beep(freq=440, dur=.12, type='sine', vol=.08){
    if(!state.soundOn) return;
    if(!state.audioCtx) initAudio();
    if(!state.audioCtx) return;
    try{
      const o = state.audioCtx.createOscillator();
      const g = state.audioCtx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, state.audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, state.audioCtx.currentTime + dur);
      o.connect(g); g.connect(state.audioCtx.destination);
      o.start();
      o.stop(state.audioCtx.currentTime + dur);
    }catch(e){}
  }

  function playSound(name){
    if(!state.soundOn) return;
    const sounds = {
      click:  () => beep(600,.08,'sine',.08),
      pop:    () => beep(880,.12,'triangle',.1),
      paper:  () => beep(300,.2,'sawtooth',.04),
      success:() => { beep(660,.1); setTimeout(()=>beep(880,.15),100); },
      fail:   () => beep(220,.2,'sawtooth',.08),
      sticker:() => beep(1200,.08,'sine',.1),
      envelope:() => { beep(440,.15); setTimeout(()=>beep(550,.15),80); },
      flip:   () => beep(500,.06,'square',.06),
      confetti:() => { beep(880,.08); setTimeout(()=>beep(1100,.08),50); setTimeout(()=>beep(1320,.1),100); }
    };
    (sounds[name] || sounds.click)();
  }

  // =========================
  // LOADING
  // =========================
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loading').classList.add('hide');
      setTimeout(() => $('#loading').remove(), 600);
    }, 600);
  });

  // =========================
  // PIN SCREEN
  // =========================
  function setupPin(){
    const inputs = $$('.pin-input');
    const error = $('#pinError');
    inputs.forEach((inp, i) => {
      inp.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g,'');
        e.target.value = val.slice(0,1);
        if(val && i < inputs.length-1) inputs[i+1].focus();
        state.pin = inputs.map(x=>x.value).join('');
        if(state.pin.length === 4){
          if(state.pin === state.pinExpected){
            playSound('success');
            unlockApp();
          } else {
            playSound('fail');
            error.classList.add('show');
            setTimeout(() => {
              error.classList.remove('show');
              inputs.forEach(x => x.value='');
              inputs[0].focus();
              state.pin = '';
            }, 1200);
          }
        }
      });
      inp.addEventListener('keydown', (e) => {
        if(e.key === 'Backspace' && !e.target.value && i > 0){
          inputs[i-1].focus();
        }
      });
      inp.addEventListener('focus', playSound.bind(null,'click'));
    });
  }

   function unlockApp(){
    const pinScreen = $('#pinScreen');
    pinScreen.classList.remove('active');
    pinScreen.style.transform = 'scale(1.1) rotate(5deg)';
    
    setTimeout(() => {
      pinScreen.remove();
      const app = $('#app');
      app.classList.add('ready');
      
      buildPages();
      buildAlbum();
      buildPlaylist();
      buildQuotes();
      buildGallery();
      buildTimeline();
      buildLetter();
      buildCover();
      showPage(0);
      burstConfetti();
      playSound('paper');

      // 🔥 AUTOPLAY MUSIC SETELAH UNLOCK 🔥
      if(DATA.playlist && DATA.playlist.length > 0) {
        const bgm = $('#bgMusic');
        const firstTrack = DATA.playlist[0]; // Ambil lagu pertama
        
        // Set sumber audio
        bgm.src = firstTrack.src || '';
        currentTrack = 0;
        
        // Update UI playlist agar tombol pertama menunjukkan "⏸"
        updatePlaylistUI(0);

        // Coba putar (Browser akan mengizinkan karena user baru saja mengetik PIN)
        bgm.play().then(() => {
          console.log("Music autoplay success!");
        }).catch(error => {
          console.log("Autoplay dicegah browser, user perlu tap play manual:", error);
          // Jika diblokir (sangat jarang setelah input PIN), user tinggal tap tombol play
        });
      }

    }, 500);
  }

  // =========================
  // PAGE NAVIGATION
  // =========================
  function buildPages(){
    state.pages = $$('.page');
  }

  function showPage(idx, dir='next'){
    if(idx < 0 || idx >= state.pages.length) return;
    const curr = state.pages[state.currentPage];
    const next = state.pages[idx];
    if(curr === next) return;

    const exitClass = dir === 'next' ? 'exit-left' : 'exit-right';
    curr.classList.remove('active');
    curr.classList.add(exitClass);
    setTimeout(() => curr.classList.remove(exitClass), 700);

    next.classList.add('active');
    state.currentPage = idx;
    updatePageIndicator();
    playSound('paper');

    // Trigger letter typing on first visit
    if(next.dataset.page === 'letter' && !state.letterTyped){
      state.letterTyped = true;
      typeLetter();
    }
  }

  function updatePageIndicator(){
    $('#pageIndicator').textContent = `${state.currentPage+1} / ${state.pages.length}`;
  }

  $('#prevPage').addEventListener('click', () => {
    showPage(state.currentPage-1, 'prev');
  });
  $('#nextPage').addEventListener('click', () => {
    showPage(state.currentPage+1, 'next');
  });

  $$('.fab[data-goto]').forEach(f => {
    f.addEventListener('click', () => {
      const target = f.dataset.goto;
      const idx = state.pages.findIndex(p => p.dataset.page === target);
      if(idx !== -1){
        const dir = idx > state.currentPage ? 'next' : 'prev';
        showPage(idx, dir);
        // Highlight active
        $$('.fab[data-goto]').forEach(x => x.classList.remove('active'));
        f.classList.add('active');
      }
    });
  });

  // Swipe gestures
  let touchStart = null;
  document.addEventListener('touchstart', e => {
    if(e.target.closest('.game-overlay') || e.target.closest('input')) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });
  document.addEventListener('touchend', e => {
    if(!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)*1.5){
      if(dx < 0) showPage(state.currentPage+1, 'next');
      else showPage(state.currentPage-1, 'prev');
    }
    touchStart = null;
  });

  // =========================
  // BUILD COVER
  // =========================
  function buildCover(){
    const cfg = DATA.cover || {};
    $('#coverMainText').textContent = cfg.occasion || 'Birthday';
    $('#coverName').textContent = DATA.recipient || 'Sayang 💖';

    const c1 = $('[data-key="cover1"]');
    const c2 = $('[data-key="cover2"]');
    if(cfg.photo1) c1.style.backgroundImage = `url(${cfg.photo1})`;
    else c1.innerHTML = '<span style="font-size:80px">🐻</span>';
    if(cfg.photo2) c2.style.backgroundImage = `url(${cfg.photo2})`;
    else c2.innerHTML = '<span style="font-size:80px">🐰</span>';
  }

  // =========================
  // BUILD ALBUM
  // =========================
  function buildAlbum(){
    const grid = $('#albumGrid');
    grid.innerHTML = '';
    (DATA.album || []).forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'album-item';
      const photoStyle = item.photo
        ? `background-image:url(${item.photo})`
        : '';
      const emoji = item.emoji || '🌸';
      el.innerHTML = `
        <div class="tape-mini ${i%2?'t-alt':''}"></div>
        <div class="album-photo" style="${photoStyle}">
          ${item.photo ? '' : `<span>${emoji}</span>`}
        </div>
        <div class="album-caption">${item.caption || 'memory'}</div>
      `;
      el.addEventListener('click', () => {
        playSound('pop');
        el.style.transform = `rotate(${(Math.random()*10-5).toFixed(1)}deg) scale(1.05)`;
      });
      grid.appendChild(el);
    });
  }

  // =========================
  // BUILD PLAYLIST
  // =========================
  let currentTrack = -1;

  // 🔥 FUNGSI BARU: Update tampilan tombol play/pause di playlist
  function updatePlaylistUI(activeIndex) {
    $$('.music-btn.play').forEach((b, i) => {
      if(i === activeIndex){
        b.textContent = '⏸';
        b.classList.add('playing');
      } else {
        b.textContent = '▶';
        b.classList.remove('playing');
      }
    });
  }

  function buildPlaylist(){
    const list = $('#playlistList');
    list.innerHTML = '';
    
    (DATA.playlist || []).forEach((track, i) => {
      const el = document.createElement('div');
      el.className = 'music-card';
      
      // 🔥 PERUBAHAN DI SINI: Cek apakah ada coverImg. 
      // Jika ada, buat elemen <img>. Jika tidak, tampilkan emoji.
      const coverContent = track.coverImg 
        ? `<img src="${track.coverImg}" alt="album cover" style="width:100%; height:100%; object-fit:cover; border-radius:12px; display:block;">` 
        : `<span style="font-size:30px">${track.cover || '🎵'}</span>`;

      el.innerHTML = `
        <div class="music-cover">
          ${coverContent}
        </div>
        <div class="music-info">
          <div class="music-title">${track.title}</div>
          <div class="music-artist">${track.artist}</div>
        </div>
        <div class="music-btns">
          <button class="music-btn play" data-idx="${i}" aria-label="Play">▶</button>
        </div>
      `;
      list.appendChild(el);
    });
    
    list.addEventListener('click', e => {
      const btn = e.target.closest('.play');
      if(!btn) return;
      const idx = +btn.dataset.idx;
      toggleTrack(idx);
    });
  }

  function toggleTrack(idx){
    const bgm = $('#bgMusic');
    const tracks = DATA.playlist || [];
    if(!tracks[idx]) return;

    if(currentTrack === idx && !bgm.paused){
      bgm.pause();
      $$('.music-btn.play').forEach(b => {
        b.textContent = '▶';
        b.classList.remove('playing');
      });
      return;
    }

    bgm.src = tracks[idx].src || '';
    bgm.play().catch(()=>{});
    currentTrack = idx;
    
    $$('.music-btn.play').forEach((b,i) => {
      if(i === idx){
        b.textContent = '⏸';
        b.classList.add('playing');
      } else {
        b.textContent = '▶';
        b.classList.remove('playing');
      }
    });
  }
  // =========================
  // BUILD QUOTES
  // =========================
  function buildQuotes(){
    const wall = $('#quotesWall');
    wall.innerHTML = '';
    (DATA.quotes || []).forEach(q => {
      const el = document.createElement('div');
      el.className = 'quote-note';
      el.textContent = q;
      wall.appendChild(el);
    });
  }

  // =========================
  // BUILD GALLERY
  // =========================
  function buildGallery(){
    const grid = $('#galleryGrid');
    grid.innerHTML = '';
    (DATA.gallery || []).forEach(item => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      const style = item.photo ? `background-image:url(${item.photo})` : '';
      const emoji = item.emoji || '💕';
      el.innerHTML = `
        <div class="gallery-photo" style="${style}">
          ${item.photo ? '' : `<span>${emoji}</span>`}
        </div>
      `;
      grid.appendChild(el);
    });
  }

  // =========================
  // BUILD TIMELINE
  // =========================
  function buildTimeline(){
    const tl = $('#timeline');
    tl.innerHTML = '';
    (DATA.timeline || []).forEach(ev => {
      const el = document.createElement('div');
      el.className = 'tl-item';
      el.innerHTML = `
        <div class="tl-date">${ev.date}</div>
        <div class="tl-title">${ev.title}</div>
        <div class="tl-desc">${ev.desc || ''}</div>
      `;
      tl.appendChild(el);
    });
  }

  // =========================
  // BUILD LETTER (typing animation)
  // =========================
  function buildLetter(){
    const d = DATA.letter || {};
    $('#letterDate').textContent = d.date || new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    $('#letterSign').textContent = d.sign || `— ${DATA.sender || 'Your Love'} 💕`;
  }

  function typeLetter(){
    const body = $('#letterBody');
    const text = (DATA.letter && DATA.letter.body) || 'Aku bersyukur kamu ada di hidupku. Setiap hari bersamamu adalah hadiah terindah. I love you so much 💕';
    body.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    body.appendChild(cursor);
    let i = 0;
    const type = () => {
      if(i < text.length){
        body.insertBefore(document.createTextNode(text[i]), cursor);
        i++;
        setTimeout(type, 40 + Math.random()*40);
        if(i%8===0) playSound('click');
      } else {
        setTimeout(() => cursor.remove(), 800);
      }
    };
    type();
  }

  // =========================
  // SECRET BOX
  // =========================
  $('#giftBox').addEventListener('click', () => {
    const box = $('#giftBox');
    const surprise = $('#surprise');
    if(box.classList.contains('opened')) return;
    box.classList.add('opened');
    playSound('pop');
    setTimeout(() => {
      burstConfetti();
      playSound('confetti');
      const content = $('#surpriseContent');
      content.innerHTML = DATA.secretBox || '<p>Surprise! 💕</p>';
      surprise.classList.add('show');
    }, 700);
  });

  // =========================
  // GAME OVERLAY
  // =========================
  const overlay = $('#gameOverlay');
  const modal = $('#gameModal');
  const content = $('#gameContent');

  function openGame(name){
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    content.innerHTML = '';
    renderGame(name);
    playSound('pop');
  }
  function closeGame(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    playSound('click');
  }

  $('#gameClose').addEventListener('click', closeGame);
  overlay.addEventListener('click', e => {
    if(e.target === overlay) closeGame();
  });

  $$('.game-card').forEach(btn => {
    btn.addEventListener('click', () => openGame(btn.dataset.game));
  });

  // =========================
  // GAME RENDERERS
  // =========================
  function renderGame(name){
    const renderers = {
      polaroid: renderPolaroid,
      sticker:  renderStickerHunt,
      envelope: renderEnvelope,
      memory:   renderMemory,
      gacha:    renderGacha,
      wheel:    renderWheel,
      hidden:   renderHiddenHearts
    };
    (renderers[name] || (()=>{}))();
  }

  // ----- 1. POLAROID -----
  function renderPolaroid(){
    content.innerHTML = `<h3>Open Polaroid 📷</h3><div class="polaroid-grid" id="poGrid"></div>`;
    const grid = $('#poGrid', content);
    const items = DATA.games.polaroid || [];
    items.forEach((it,i) => {
      const card = document.createElement('div');
      card.className = 'po-card';
      const photoStyle = it.photo ? `background-image:url(${it.photo})` : '';
      const emoji = it.emoji || '🌸';
      card.innerHTML = `
        <div class="po-inner">
          <div class="po-face po-back">💌</div>
          <div class="po-face po-front">
            <div class="po-img" style="${photoStyle}">${it.photo?'':`<span>${emoji}</span>`}</div>
            <div class="po-cap">${it.caption||''}</div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        if(!card.classList.contains('flipped')){
          card.classList.add('flipped');
          playSound('flip');
        }
      });
      grid.appendChild(card);
    });
  }

  // ----- 2. STICKER HUNT -----
  function renderStickerHunt(){
    state.stickerFound = 0;
    const total = (DATA.games.stickers || []).length || 5;
    content.innerHTML = `
      <h3>Sticker Hunt 🎟️</h3>
      <p style="text-align:center;font-family:Caveat,cursive;font-size:20px;color:var(--pink-deep);margin-bottom:10px">
        Temukan ${total} stiker tersembunyi!
      </p>
      <div class="sticker-scene" id="stickerScene"></div>
      <div class="hunt-progress">
        <span id="stickerCount">0 / ${total}</span>
        <div class="progress-bar"><div class="progress-fill" id="stickerFill"></div></div>
      </div>
      <div id="stickerReward" style="margin-top:14px"></div>
    `;
    const scene = $('#stickerScene', content);
    // Decorative background
    const deco = ['🌸','🌷','☁️','⭐','🎈','🌿','🌼','🍃','💫'];
    for(let i=0;i<20;i++){
      const d = document.createElement('span');
      d.className = 'deco-bg';
      d.textContent = deco[i%deco.length];
      d.style.left = Math.random()*90 + '%';
      d.style.top = Math.random()*90 + '%';
      d.style.fontSize = (20 + Math.random()*20) + 'px';
      scene.appendChild(d);
    }
    // Target stickers
    const stickers = DATA.games.stickers || [];
    stickers.forEach((s,i) => {
      const el = document.createElement('span');
      el.className = 'hunt-sticker';
      el.textContent = s.emoji || '🌟';
      el.style.left = s.x + '%';
      el.style.top = s.y + '%';
      el.addEventListener('click', () => {
        if(el.classList.contains('found')) return;
        el.classList.add('found');
        state.stickerFound++;
        playSound('sticker');
        updateStickerUI(total);
        if(state.stickerFound === total){
          setTimeout(() => {
            burstConfetti();
            playSound('success');
            const reward = $('#stickerReward', content);
            reward.innerHTML = `
              <div style="background:var(--white);padding:14px;border-radius:14px;border:3px dashed var(--pink-deep);text-align:center">
                <div style="font-size:40px">🎉</div>
                <div style="font-family:Caveat,cursive;font-size:24px;color:var(--red)">
                  ${DATA.games.stickerReward || 'Foto rahasia terbuka! 💕'}
                </div>
              </div>
            `;
          }, 400);
        }
      });
      scene.appendChild(el);
    });
  }

  function updateStickerUI(total){
    $('#stickerCount').textContent = `${state.stickerFound} / ${total}`;
    $('#stickerFill').style.width = (state.stickerFound/total*100) + '%';
  }

  // ----- 3. ENVELOPE -----
  function renderEnvelope(){
    content.innerHTML = `
      <h3>Love Letter Envelope 💌</h3>
      <div class="envelope-wrap">
        <div class="envelope" id="envelope">
          <div class="env-body"></div>
          <div class="env-letter" id="envLetter">
            ${DATA.games.envelopeLetter || 'Surat cinta untukmu sayang... 💕'}
          </div>
          <div class="env-flap"></div>
          <div class="env-front"></div>
          <div class="env-seal">♥</div>
        </div>
        <div class="env-hint">Tap untuk membuka 💕</div>
      </div>
    `;
    const env = $('#envelope', content);
    env.addEventListener('click', () => {
      if(env.classList.contains('open')) return;
      env.classList.add('open');
      playSound('envelope');
    });
  }

  // ----- 4. MEMORY PUZZLE -----
  function renderMemory(){
    const emojis = DATA.games.memoryEmojis || ['🌸','🐰','🐻','🦆','🍰','🍒','💕','⭐'];
    const deck = shuffle([...emojis, ...emojis]);
    content.innerHTML = `
      <h3>Memory Puzzle 🧩</h3>
      <div class="mem-grid" id="memGrid"></div>
      <div class="mem-status" id="memStatus">Cocokkan semua pasangan!</div>
    `;
    const grid = $('#memGrid', content);
    state.memFlip = [];
    state.memLock = false;
    state.memMatched = 0;

    deck.forEach((emoji, i) => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.emoji = emoji;
      card.innerHTML = `
        <div class="mem-inner">
          <div class="mem-face mem-front"></div>
          <div class="mem-face mem-back">${emoji}</div>
        </div>
      `;
      card.addEventListener('click', () => flipMem(card));
      grid.appendChild(card);
    });
  }

  function flipMem(card){
    if(state.memLock || card.classList.contains('flip') || card.classList.contains('matched')) return;
    card.classList.add('flip');
    playSound('flip');
    state.memFlip.push(card);
    if(state.memFlip.length === 2){
      state.memLock = true;
      const [a,b] = state.memFlip;
      if(a.dataset.emoji === b.dataset.emoji){
        a.classList.add('matched');
        b.classList.add('matched');
        state.memMatched++;
        playSound('success');
        state.memFlip = [];
        state.memLock = false;
        const total = $$('.mem-card', content).length / 2;
        if(state.memMatched === total){
          setTimeout(() => {
            burstConfetti();
            $('#memStatus', content).textContent = 'Selamat! Kamu menang! 🎉💕';
            playSound('confetti');
          }, 400);
        }
      } else {
        setTimeout(() => {
          a.classList.remove('flip');
          b.classList.remove('flip');
          state.memFlip = [];
          state.memLock = false;
        }, 800);
      }
    }
  }

  // ----- 5. GACHA -----
  function renderGacha(){
    content.innerHTML = `
      <h3>Fortune Gacha 🎰</h3>
      <div class="gacha-machine">
        <div class="gacha-body">
          <div class="gacha-globe">
            <span class="capsule">💊</span>
            <span class="capsule">💊</span>
            <span class="capsule">💊</span>
          </div>
          <div class="gacha-slot"></div>
          <div style="display:flex;justify-content:center">
            <div class="gacha-knob" id="gachaKnob"></div>
          </div>
        </div>
        <div class="gacha-result" id="gachaResult">Putar knob untuk dapat quote 💕</div>
      </div>
    `;
    $('#gachaKnob', content).addEventListener('click', spinGacha);
  }

  function spinGacha(){
    const knob = $('#gachaKnob', content);
    const result = $('#gachaResult', content);
    if(knob.classList.contains('spin')) return;
    knob.classList.add('spin');
    result.classList.remove('show');
    playSound('pop');
    setTimeout(() => {
      const quotes = DATA.games.gachaQuotes || ['You are my sunshine ☀️'];
      const q = quotes[Math.floor(Math.random()*quotes.length)];
      result.textContent = q;
      result.classList.add('show');
      knob.classList.remove('spin');
      playSound('success');
    }, 1500);
  }

  // ----- 6. SPIN WHEEL -----
  function renderWheel(){
    const segs = DATA.games.wheelSegments || [
      {label:'💕',text:'Love you!'},
      {label:'🎁',text:'Gift from me'},
      {label:'🎵',text:'Our song'},
      {label:'📸',text:'Photo memory'},
      {label:'🍰',text:'Sweet date'},
      {label:'⭐',text:'Special wish'}
    ];
    const colors = ['#FF6B9D','#FF8C42','#87CEEB','#FFB6C1','#E63946','#FFEAA7'];
    const deg = 360/segs.length;

    let segsHtml = '';
    segs.forEach((s,i) => {
      const rot = deg*i;
      const skew = 90 - deg;
      segsHtml += `
        <div class="wheel-seg" style="
          background:${colors[i%colors.length]};
          transform:rotate(${rot}deg) skewY(-${skew}deg);
          clip-path:polygon(0 0, 100% 0, 100% 100%);
        ">
          <span style="transform:skewY(${skew}deg) rotate(${deg/2}deg);display:inline-block">${s.label}</span>
        </div>
      `;
    });

    content.innerHTML = `
      <h3>Spin Love Wheel 🎡</h3>
      <div class="wheel-wrap">
        <div class="wheel-container">
          <div class="wheel-pointer"></div>
          <div class="wheel" id="theWheel">${segsHtml}</div>
          <div class="wheel-center">💕</div>
        </div>
        <button class="wheel-btn" id="spinBtn">SPIN!</button>
        <div class="wheel-result" id="wheelResult">Putar untuk hadiah 💕</div>
      </div>
    `;
    $('#spinBtn', content).addEventListener('click', () => spinWheel(segs, deg));
  }

  function spinWheel(segs, deg){
    if(state.wheelSpinning) return;
    state.wheelSpinning = true;
    const wheel = $('#theWheel', content);
    const btn = $('#spinBtn', content);
    btn.disabled = true;
    const idx = Math.floor(Math.random()*segs.length);
    const spins = 5*360;
    const target = spins + (360 - idx*deg - deg/2);
    wheel.style.transform = `rotate(${target}deg)`;
    playSound('pop');
    setTimeout(() => {
      $('#wheelResult', content).textContent = segs[idx].text;
      burstConfetti();
      playSound('success');
      state.wheelSpinning = false;
      btn.disabled = false;
    }, 4000);
  }

  // ----- 7. HIDDEN HEARTS -----
  function renderHiddenHearts(){
    state.heartsFound = 0;
    const total = (DATA.games.hiddenHearts || []).length || 5;
    content.innerHTML = `
      <h3>Hidden Hearts 💞</h3>
      <p style="text-align:center;font-family:Caveat,cursive;font-size:20px;color:var(--pink-deep);margin-bottom:10px">
        Temukan ${total} hati tersembunyi!
      </p>
      <div class="hidden-scene" id="hiddenScene"></div>
      <div class="hidden-status">
        <span id="heartCount">0 / ${total}</span>
      </div>
      <div id="heartReward" style="margin-top:14px"></div>
    `;
    const scene = $('#hiddenScene', content);
    // Deco objects
    const deco = ['🌸','🌷','☁️','⭐','🎈','🌿','🌼','🍃','💫','🐰','🐻','🦋','🌺','🎀','🍓','🍰'];
    for(let i=0;i<25;i++){
      const d = document.createElement('span');
      d.className = 'obj';
      d.textContent = deco[i%deco.length];
      d.style.left = Math.random()*90 + '%';
      d.style.top = Math.random()*90 + '%';
      scene.appendChild(d);
    }
    // Hidden hearts
    (DATA.games.hiddenHearts || []).forEach(h => {
      const el = document.createElement('span');
      el.className = 'hidden-heart';
      el.textContent = '💗';
      el.style.left = h.x + '%';
      el.style.top = h.y + '%';
      el.style.opacity = h.opacity || .55;
      el.addEventListener('click', () => {
        if(el.classList.contains('found')) return;
        el.classList.add('found');
        state.heartsFound++;
        playSound('sticker');
        $('#heartCount').textContent = `${state.heartsFound} / ${total}`;
        if(state.heartsFound === total){
          setTimeout(() => {
            burstConfetti();
            playSound('success');
            $('#heartReward', content).innerHTML = `
              <div style="background:var(--white);padding:14px;border-radius:14px;border:3px dashed var(--pink-deep);text-align:center">
                <div style="font-size:40px">💖</div>
                <div style="font-family:Caveat,cursive;font-size:24px;color:var(--red)">
                  Gallery Premium Unlocked! 🎉
                </div>
              </div>
            `;
          }, 400);
        }
      });
      scene.appendChild(el);
    });
  }

   // =========================
  // TOUCH EFFECT (canvas) - VERSI LEBIH RINGAN
  // =========================
  const canvas = $('#touchCanvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const emojis = ['💕', '✨', '🌸', '🎀', '🦋']; // Dikurangi agar tidak berlebihan

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function spawnParticle(x, y){
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 1.5, // Gerakan lebih pelan
      vy: -1 - Math.random() * 1.5,
      life: 1,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 3,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 14 + Math.random() * 8 // Ukuran sedikit lebih kecil
    });
  }

  function drawParticles(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03; // Gravitasi lebih ringan
      p.rot += p.rotV;
      p.life -= 0.025; // LEBIH CEPAT HILANG (fade out cepat)
      
      if(p.life <= 0){ 
        particles.splice(i, 1); 
        continue; 
      }
      
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // EVENT LISTENER: Hanya munculkan 1 partikel per klik/sentuh agar tidak berlebihan
  document.addEventListener('click', e => {
    if(e.target.closest('.fab-nav') || e.target.closest('.game-overlay') || e.target.closest('input') || e.target.closest('button')) return;
    spawnParticle(e.clientX, e.clientY); // Hanya 1, tidak pakai loop
  });
  
  document.addEventListener('touchstart', e => {
    if(e.target.closest('.fab-nav') || e.target.closest('.game-overlay') || e.target.closest('input')) return;
    spawnParticle(e.touches[0].clientX, e.touches[0].clientY); // Hanya 1
  }, {passive: true}); // passive: true WAJIB agar scroll tidak terblokir

  // =========================
  // CONFETTI
  // =========================
  function burstConfetti(){
    const layer = $('#confettiLayer');
    const colors = ['#FF6B9D','#FF8C42','#87CEEB','#FFEAA7','#FFB6C1','#E63946'];
    for(let i=0;i<50;i++){
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random()*100 + '%';
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.animationDelay = (Math.random()*.5) + 's';
      p.style.animationDuration = (2 + Math.random()*2) + 's';
      p.style.transform = `rotate(${Math.random()*360}deg)`;
      if(Math.random()>.5) p.style.borderRadius = '50%';
      layer.appendChild(p);
      setTimeout(() => p.remove(), 4500);
    }
  }

  // =========================
  // SOUND TOGGLE
  // =========================
  $('#soundToggle').addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    $('#soundToggle').textContent = state.soundOn ? '🔊' : '🔇';
    if(state.soundOn) playSound('pop');
  });

  // =========================
  // INIT
  // =========================
  function init(){
    setupPin();
    // Resume audio context on first user interaction
    document.addEventListener('click', () => initAudio(), {once:true});
    document.addEventListener('touchstart', () => initAudio(), {once:true});
  }
  init();

})();