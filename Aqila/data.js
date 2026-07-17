/* ============================================================
   DATA FILE — Edit semua konten di sini!
   ============================================================ */

const DATA = {

  // PIN 4 digit (tanggal jadian / spesial)
  pin: '1234',

  // Penerima
  recipient: 'Aqila 💖',
  sender: '-',

  // COVER
  cover: {
    occasion: 'Birthday',    // Birthday / Anniversary / Valentine
    photo1: 'assets/gambar/hero.webp',              // URL foto 1 (kosongkan untuk emoji)
    photo2: 'assets/gambar/photo4.webp'               // URL foto 2
  },

  // ALBUM (6-8 foto)
  album: [
    { photo: 'assets/gambar/photo2.webp', emoji: '🌸', caption: 'first date' },
    { photo: 'assets/gambar/photo4.webp', emoji: '🐰', caption: 'cute moment' },
    { photo: 'assets/gambar/photo5.webp', emoji: '☕', caption: 'coffee date' },
    { photo: 'assets/gambar/photo6.webp', emoji: '🌷', caption: 'spring day' },
    { photo: 'assets/gambar/photo7.webp', emoji: '🎂', caption: 'birthday' },
    { photo: 'assets/gambar/photo8.webp', emoji: '🌅', caption: 'sunset' }
  ],

  // PLAYLIST
  playlist: [

    { 
      title: 'Sampai Jadi Debu', 
      artist: 'Bandaneira', 
      coverImg: 'assets/gambar/ab6761610000e5eb1b60759fc037d4155431e541.jpg', 
      src: 'assets/lagu/Bandaneira Sampai Jadi Debu (unofficial music video) - DUNIA FILM.mp3' 
    },
 
  ],
  // QUOTES
  quotes: [
    'Kamu adalah alasan aku tersenyum setiap hari 💕',
    'Bersamamu, setiap hari terasa seperti hadiah 🎁',
    'My favorite place is next to you 🌸',
    'You are my today and all of my tomorrows ⭐',
    'I love you more than words can say 💖'
  ],

  // GALLERY (pinterest-style)
  gallery: [
    { photo: 'assets/gambar/photoa.webp', emoji: '🌸' },
    { photo: 'assets/gambar/hero.webp', emoji: '🐻' },
    { photo: 'assets/gambar/photob.webp', emoji: '🎀' },
    { photo: 'assets/gambar/photo1.webp', emoji: '🍰' },
    { photo: 'assets/gambar/photo2.webp', emoji: '🦋' },
    { photo: 'assets/gambar/photo3.webp', emoji: '💕' },
    { photo: 'assets/gambar/photo4.webp', emoji: '🌷' },
    { photo: 'assets/gambar/photo5.webp', emoji: '🐰' }
  ],

  // TIMELINE
  timeline: [
    { date: '14 Feb 2023', title: 'First Meet',  desc: 'Hari pertama kita bertemu, dan aku tahu kamu spesial 💕' },
    { date: '20 Mar 2023', title: 'First Date',  desc: 'Dinner berdua, ngobrol sampai lupa waktu 🍝' },
    { date: '10 Apr 2023', title: 'Official',    desc: 'Hari kita resmi jadi sepasang 💖' },
    { date: '25 Dec 2023', title: 'Christmas',   desc: 'Natal pertama bareng, hadiah terbaik adalah kamu 🎄' }
  ],

  // LOVE LETTER
  letter: {
    date: '',
    body: `Hai sayang,\n\nAku nggak tau harus mulai dari mana, tapi yang pasti aku bersyukur banget kamu ada di hidupku.\n\nSetiap hari bersamamu terasa seperti hadiah. Ketawamu, senyummu, bahkan omelanmu pun aku sayang 🥰\n\nTerima kasih sudah jadi rumah buat hatiku. Aku janji akan selalu ada buat kamu.\n\nI love you, more than words could ever say 💕`,
    sign: '— - 💕'
  },

  // SECRET BOX
  secretBox: `
    <div style="font-size:50px">🎁</div>
    <h3 style="font-family:Caveat,cursive;font-size:32px;color:var(--red);margin:10px 0">Surprise!</h3>
    <p>Voucher dinner romantis untuk kita berdua 🍝💕<br><br>Siap di redeem kapan aja ya sayang!</p>
  `,

  // GAMES
  games: {
    // 1. Polaroid
    polaroid: [
      { photo: 'assets/gambar/photo6.webp', emoji: '🌸', caption: 'flower date' },
      { photo: 'assets/gambar/photo7.webp', emoji: '🐰', caption: 'bunny love' },
      { photo: 'assets/gambar/photo8.webp', emoji: '☕', caption: 'coffee' },
      { photo: 'assets/gambar/photo9.webp', emoji: '🍰', caption: 'sweet' },
      { photo: 'assets/gambar/photo10.webp', emoji: '🌅', caption: 'sunset' },
      { photo: 'assets/gambar/photoa.webp', emoji: '💕', caption: 'us' }
    ],

    // 2. Sticker Hunt — posisi x,y dalam persen
    stickers: [
      { emoji: '🌟', x: 15, y: 20 },
      { emoji: '🎀', x: 70, y: 35 },
      { emoji: '🌸', x: 40, y: 65 },
      { emoji: '💖', x: 80, y: 75 },
      { emoji: '🦋', x: 25, y: 85 }
    ],
    stickerReward: '🎉 Foto rahasia unlocked! Kamu hebat sayang 💕',

    // 3. Envelope
    envelopeLetter: 'Sayangku, setiap kali aku lihat kamu, duniaku terasa lebih indah. Terima kasih sudah jadi bagian terbaik dari hidupku. Aku cinta kamu selamanya 💕',

    // 4. Memory Puzzle
    memoryEmojis: ['🌸','🐰','🐻','🦆','🍰','🍒','💕','⭐'],

    // 5. Gacha quotes
    gachaQuotes: [
      'You are my sunshine ☀️',
      'I fall for you every day 💕',
      'My heart beats only for you 💓',
      'You make me complete 🌸',
      'Forever and always 💖',
      'Kamu adalah jawabanku ⭐'
    ],

    // 6. Spin Wheel
    wheelSegments: [
      { label: '💕', text: 'Love you more than yesterday!' },
      { label: '🎁', text: 'Free gift from me 🎁' },
      { label: '🎵', text: 'Dengerin lagu "Our Song" bareng 🎵' },
      { label: '📸', text: 'Photo date weekend ini! 📸' },
      { label: '🍰', text: 'Aku masakin kue spesial 🍰' },
      { label: '⭐', text: 'Make a wish, sayang! ⭐' }
    ],

    // 7. Hidden Hearts
    hiddenHearts: [
      { x: 20, y: 25, opacity: .5 },
      { x: 65, y: 15, opacity: .4 },
      { x: 80, y: 60, opacity: .5 },
      { x: 35, y: 70, opacity: .45 },
      { x: 50, y: 45, opacity: .5 }
    ]
  }
};