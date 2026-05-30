// DOM Elements
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
const musicText = document.getElementById('music-text');
const musicIconPlaceholder = document.getElementById('music-svg-placeholder');

// Password Gate Elements
const gatePassword = document.getElementById('gate-password');
const btnUnlockGate = document.getElementById('btn-unlock-gate');

// Envelope Elements
const mainEnvelope = document.getElementById('main-envelope');
const envelopeClickable = document.getElementById('envelope-clickable');

// General steps & buttons
const steps = document.querySelectorAll('.step-content');
const btnToStep2 = document.getElementById('btn-to-step2');
const btnToStep3 = document.getElementById('btn-to-step3');
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnSendReply = document.getElementById('btn-send-reply');

// Love Meter Elements
const loveSlider = document.getElementById('love-slider');
const meterVal = document.getElementById('meter-val');
const meterTag = document.getElementById('meter-tag');
const loveStatusMsg = document.getElementById('love-status-msg');

// Reply Form Elements
const loveNote = document.getElementById('love-note');
const replyForm = document.getElementById('reply-letter-form');
const replySentMsg = document.getElementById('reply-sent-msg');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');

// State Variables
let isMusicPlaying = false;
let currentStepIndex = 0; // Index 0: Gate, 1: Envelope, 2: Memories, 3: LoveMeter, 4: Proposal, 5: Celebration
let yesButtonScale = 1.0;

// SVG Icons for Music Toggle
const musicOnSvg = `<svg width="18" height="18" fill="currentColor"><use href="#icon-music-on"/></svg>`;
const musicOffSvg = `<svg width="18" height="18" fill="currentColor"><use href="#icon-music-off"/></svg>`;

// Custom canvas for floating hearts
const canvas = document.getElementById('canvas-hearts');
const ctx = canvas.getContext('2d');

let hearts = [];
const maxHearts = 45;
let celebrationMode = false;

// Initialize Canvas Size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Heart Particle Class
class Heart {
    constructor(isCelebration = false) {
        this.reset(isCelebration);
        if (isCelebration) {
            // Start from center of card/screen during celebration click
            this.x = canvas.width / 2 + (Math.random() - 0.5) * 150;
            this.y = canvas.height / 2 + (Math.random() - 0.5) * 150;
            this.vy = -(Math.random() * 5 + 4); // fly up quickly
            this.vx = (Math.random() - 0.5) * 8; // disperse horizontally
        }
    }

    reset(isCelebration = false) {
        this.size = Math.random() * 12 + 6;
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + this.size + (isCelebration ? Math.random() * 50 : 0);
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(Math.random() * 1.8 + 0.8);
        this.opacity = Math.random() * 0.6 + 0.2;
        this.color = Math.random() > 0.4 ? '#ff2a74' : '#a12cff'; // Neon pink or Neon purple
        this.glow = Math.random() > 0.5;
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        if (celebrationMode) {
            this.opacity -= 0.003;
        }

        // Reset if out of bounds or opacity fades out
        if (this.y < -this.size || this.x < -this.size || this.x > canvas.width + this.size || this.opacity <= 0) {
            this.reset(celebrationMode);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.opacity);
        
        if (this.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        ctx.fillStyle = this.color;
        
        // Draw standard SVG-like path heart
        ctx.beginPath();
        const topY = -this.size / 2;
        ctx.moveTo(0, topY + this.size / 4);
        // Left side curve
        ctx.bezierCurveTo(-this.size/2, topY, -this.size, topY + this.size/3, -this.size/2, topY + this.size*0.7);
        ctx.lineTo(0, topY + this.size);
        // Right side curve
        ctx.lineTo(this.size/2, topY + this.size*0.7);
        ctx.bezierCurveTo(this.size, topY + this.size/3, this.size/2, topY, 0, topY + this.size/4);
        
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

// Sparkle/Star Particle Class (for extra cyber emo style)
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.8 + 0.1;
        this.pulse = Math.random() * 0.02 + 0.005;
        this.color = '#00f0ff'; // Neon cyan
    }
    update() {
        this.opacity += this.pulse;
        if (this.opacity > 0.9 || this.opacity < 0.1) {
            this.pulse = -this.pulse;
        }
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

let particles = [];
// Initialize particles
for(let i = 0; i < maxHearts; i++) {
    particles.push(new Heart());
}
for(let i = 0; i < 30; i++) {
    particles.push(new Star());
}

// Particle Loop Animation
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}
animateParticles();

// Floating toast alerts
function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Music player management
function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
        musicIconPlaceholder.innerHTML = musicOffSvg;
        musicText.textContent = "Putar Musik 🎵";
        isMusicPlaying = false;
    } else {
        // Simple promise handling for browser security
        bgMusic.play().then(() => {
            musicBtn.classList.add('playing');
            musicIconPlaceholder.innerHTML = musicOnSvg;
            musicText.textContent = "Musik Aktif 💖";
            isMusicPlaying = true;
        }).catch(err => {
            showToast("Ketuk layar untuk mengizinkan musik diputar!");
            console.log("Playback blocked:", err);
        });
    }
}
musicBtn.addEventListener('click', toggleMusic);

// Transition between steps
function showStep(index) {
    steps.forEach((step, i) => {
        if (i === index) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    currentStepIndex = index;
}

// Password Gate unlock handler
function attemptUnlock() {
    const entered = gatePassword.value.trim().toLowerCase();
    // Allow multiple variants of correct password for sweet ease of use!
    const correctPasswords = ['sayangku123', 'ayyie', 'ayyie123', 'aell'];
    
    if (correctPasswords.includes(entered)) {
        showToast("Akses diizinkan! Membuka halaman rahasia... 🖤🔑");
        
        // Auto play music (works since it is triggered by click)
        if (!isMusicPlaying) {
            bgMusic.play().then(() => {
                musicBtn.classList.add('playing');
                musicIconPlaceholder.innerHTML = musicOnSvg;
                musicText.textContent = "Musik Aktif 💖";
                isMusicPlaying = true;
            }).catch(e => console.log(e));
        }

        // Trigger gorgeous floating heart explosion
        for (let i = 0; i < 35; i++) {
            particles.push(new Heart(true));
        }

        // Transition directly to the proposal slide (Step 3 in HTML, which is index 4 in code!)
        setTimeout(() => {
            showStep(4); // index 4: step-proposal
        }, 800);
    } else {
        showToast("Password salah! Silakan coba lagi ya Ayyie... 💀🖤");
        gatePassword.style.animation = "shake 0.5s ease";
        setTimeout(() => {
            gatePassword.style.animation = "";
        }, 500);
    }
}

btnUnlockGate.addEventListener('click', attemptUnlock);
gatePassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        attemptUnlock();
    }
});

// Envelope Clicked (Step 1 -> Step 2)
envelopeClickable.addEventListener('click', () => {
    mainEnvelope.classList.add('open');
    
    // Automatically play music on envelope opening
    if (!isMusicPlaying) {
        bgMusic.play().then(() => {
            musicBtn.classList.add('playing');
            musicIconPlaceholder.innerHTML = musicOnSvg;
            musicText.textContent = "Musik Aktif 💖";
            isMusicPlaying = true;
        }).catch(e => console.log(e));
    }

    showToast("Membuka surat cinta Ayyie... 🖤");

    setTimeout(() => {
        showStep(2); // index 2: memories
    }, 1200);
});

// STEP 1: Slide Carousel Controls
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const btnPrevSlide = document.getElementById('btn-prev-slide');
const btnNextSlide = document.getElementById('btn-next-slide');

function showSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    currentSlide = index;
}

btnPrevSlide.addEventListener('click', () => {
    let prev = currentSlide - 1;
    if (prev < 0) prev = slides.length - 1;
    showSlide(prev);
});

btnNextSlide.addEventListener('click', () => {
    let next = currentSlide + 1;
    if (next >= slides.length) next = 0;
    showSlide(next);
});

dots.forEach((dot) => {
    dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'));
        showSlide(idx);
    });
});

// Memories Carousel button click (Step 2 -> Step 3)
btnToStep2.addEventListener('click', () => {
    showStep(3); // index 3: lovemeter
});

// STEP 2: Interactive Love Meter
loveSlider.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    
    // Magic multiplier at 100%
    if (val === 100) {
        meterVal.textContent = "1000% EMO LOVE!";
        meterVal.style.color = '#ff2a74';
        meterVal.style.textShadow = '0 0 25px #ff2a74, 0 0 10px #fff';
        loveStatusMsg.textContent = "Infinite Emo Love! Rasa sayangku ke kamu tak terhingga, Ayyie! 🖤🌹🎸";
        loveStatusMsg.style.color = '#00f0ff';
        
        // Show NEXT button with glowing transition
        btnToStep3.style.display = 'inline-flex';
        btnToStep3.scrollIntoView({ behavior: 'smooth' });
    } else {
        meterVal.textContent = val + "%";
        meterVal.style.color = '';
        meterVal.style.textShadow = '';
        btnToStep3.style.display = 'none';

        if (val < 30) {
            loveStatusMsg.textContent = "Hehe geser lagi dong Ayyie... 🖤";
            loveStatusMsg.style.color = '';
        } else if (val >= 30 && val < 70) {
            loveStatusMsg.textContent = "Wah, sayang banget nih! Tapi masih bisa lebih banyak lagi... 🥰";
            loveStatusMsg.style.color = '#bd00ff';
        } else {
            loveStatusMsg.textContent = "Dikit lagi! Rasa sayangku meluap-luap nih! ⚡🎸";
            loveStatusMsg.style.color = '#ff758f';
        }
    }

    // Position the badge/tag beautifully along the slider thumb
    const sliderWidth = loveSlider.offsetWidth;
    const bulletPosition = (val / 100) * (sliderWidth - 26) + 13; // adjust with thumb size
    meterTag.style.left = bulletPosition + "px";
    meterTag.textContent = val + "%";
    meterTag.style.display = 'block';
});

loveSlider.addEventListener('change', () => {
    // Hide the tiny tag after sliding stops
    setTimeout(() => {
        meterTag.style.display = 'none';
    }, 1000);
});

// Love Meter button click (Step 3 -> Step 4)
btnToStep3.addEventListener('click', () => {
    showStep(4); // index 4: proposal
});

// STEP 3: Interactive Button Morph Logic (NO becomes YES)
let isNoMorphed = false;

function morphNoToYes() {
    if (isNoMorphed) return;
    
    isNoMorphed = true;
    
    // Change text and icon to match YES
    btnNo.innerHTML = `<svg width="18" height="18" fill="currentColor" style="vertical-align: middle;"><use href="#icon-heart"/></svg> YES 🖤`;
    
    // Apply styling of the YES button (Neon pink bg and glow)
    btnNo.style.background = 'var(--primary-neon)';
    btnNo.style.borderColor = 'var(--primary-neon)';
    btnNo.style.boxShadow = '0 0 20px var(--primary-glow)';
    btnNo.style.color = '#fff';
    
    showToast("Cieee, pilihannya jadi YES semua! 😄🌹🖤");
}

// Trigger morph on hover or touch
btnNo.addEventListener('mouseenter', morphNoToYes);
btnNo.addEventListener('touchstart', (e) => {
    morphNoToYes();
});

// Handle Proposal Acceptance
function acceptProposal() {
    celebrationMode = true;
    
    // Add heavy burst of fast upward floating hearts
    for (let i = 0; i < 75; i++) {
        particles.push(new Heart(true));
    }

    showToast("AKU SAYANG KAMU AYYIE! 🖤🎉");
    
    // Send AJAX "Accept" response to PHP
    fetch('save_response.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'accept' })
    })
    .then(response => response.json())
    .then(data => {
        console.log("PHP Response saved:", data);
    })
    .catch(error => {
        console.error("Error saving response:", error);
    });

    // Proceed to Step 5 (Celebration page)
    showStep(5); // index 5: celebration
}

// Click listener for both Yes and morphed No button
btnYes.addEventListener('click', acceptProposal);
btnNo.addEventListener('click', (e) => {
    // If it hasn't morphed yet, morph it first and then accept
    if (!isNoMorphed) {
        morphNoToYes();
        // Give a tiny visual pause before moving to step 5 so they see it changed
        setTimeout(acceptProposal, 300);
    } else {
        acceptProposal();
    }
});

// STEP 4: Submit Written Reply Letter
btnSendReply.addEventListener('click', () => {
    const noteContent = loveNote.value.trim();

    if (noteContent === "") {
        showToast("Tulis sesuatu dulu ya Ayyie... 🖤");
        return;
    }

    btnSendReply.disabled = true;
    btnSendReply.textContent = "Mengirim surat... 🕊️";

    // ==========================================
    // CONFIGURATION: SILAKAN GANTI NOMOR DI BAWAH INI DENGAN NOMOR WHATSAPP KAMU!
    // Awali dengan kode negara tanpa tanda '+', contoh: 6285123456789
    // ==========================================
    const WHATSAPP_NUMBER = "6285123456789"; // <-- GANTI DENGAN NOMOR WHATSAPP KAMU
    
    const whatsappText = `Hai Aell! 🖤 Aku udah buka website surat cinta kamu, dan aku mau jadi pacar kamu! 🌹🎸\n\nIni surat balasan aku:\n"${noteContent}"`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(whatsappText)}`;

    // Open WhatsApp in a new tab to ensure Aell receives her message
    window.open(whatsappUrl, '_blank');

    // Send AJAX reply letter to PHP (for local XAMPP server compatibility)
    fetch('save_response.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'reply',
            message: noteContent
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast("Surat balasan terkirim & dibuka di WhatsApp! 🖤🌹");
            replyForm.style.display = 'none';
            replySentMsg.style.display = 'block';
        } else {
            // If PHP returns false, still show success in UI since WhatsApp opened
            showToast("Surat balasan dibuka di WhatsApp! 🖤🌹");
            replyForm.style.display = 'none';
            replySentMsg.style.display = 'block';
        }
    })
    .catch(error => {
        // Fallback for static servers like GitHub Pages
        console.log("Static server fallback: opened WhatsApp.", error);
        showToast("Membuka WhatsApp untuk mengirim pesan... 🖤🌹");
        replyForm.style.display = 'none';
        replySentMsg.style.display = 'block';
    });
});
