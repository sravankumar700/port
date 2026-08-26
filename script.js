const navigation = document.querySelector('nav');
const menuToggle = document.querySelector('.menu-toggle');

function closeMenu() {
    if (!navigation || !menuToggle) {
        return;
    }
    navigation.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
}

menuToggle?.addEventListener('click', function() {
    const isOpen = navigation.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMenu();
    }
});

document.addEventListener('click', function(event) {
    if (navigation && !navigation.contains(event.target)) {
        closeMenu();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        closeMenu();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== LENIS SMOOTH SCROLL =====
var lenis = new Lenis({
    duration: 1.2,
    easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5
});

function lenisRaf(time) {
    lenis.raf(time);
    requestAnimationFrame(lenisRaf);
}
requestAnimationFrame(lenisRaf);

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// ===== GSAP SCROLL ANIMATIONS =====
gsap.registerPlugin(ScrollTrigger);

// Title clip-path reveal
gsap.utils.toArray('.reveal-title').forEach(function(el) {
    gsap.to(el, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
        }
    });
});

// Staggered reveal-up elements
gsap.utils.toArray('.reveal-up').forEach(function(el) {
    gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none'
        }
    });
});

// Skill cards staggered batch (skills-grid sections — learning section)
gsap.utils.toArray('.skills-grid').forEach(function(grid) {
    var cards = grid.querySelectorAll('.skill-card');
    gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: grid,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );
});

// Credential items stagger
gsap.utils.toArray('.credentials').forEach(function(group) {
    var items = group.querySelectorAll('.credential-item');
    gsap.fromTo(items,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
                trigger: group,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        }
    );
});

// Service items slide in from left
gsap.utils.toArray('.service-item').forEach(function(el) {
    gsap.fromTo(el,
        { opacity: 0, x: -30 },
        {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        }
    );
});

// ===== HORIZONTAL PROJECT SCRUB =====
(function() {
    var section  = document.querySelector('.portfolio');
    var track    = document.getElementById('projTrack');
    var indWrap  = document.getElementById('arcIndicators');
    if (!section || !track) return;

    var cards   = Array.from(track.querySelectorAll('.arc-card'));
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobile  = window.innerWidth < 768;

    // Build dot indicators
    var dots = cards.map(function(_, i) {
        var d = document.createElement('button');
        d.className = 'arc-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Go to project ' + (i + 1));
        indWrap.appendChild(d);
        return d;
    });

    // ---- MOBILE / REDUCED-MOTION: plain vertical stack, no scrub ----
    if (mobile || reduced) {
        initImageCarousels();
        return;
    }

    // ---- DESKTOP: GSAP horizontal scrub ----
    // How far the track needs to travel to show the last card
    function getScrollDist() {
        return track.scrollWidth - window.innerWidth;
    }

    var st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: function() { return '+=' + (getScrollDist() + window.innerHeight * 0.3); },
        pin: true,
        scrub: 1.1,           // weighted lag — feels like momentum
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function(self) {
            // Translate track left proportional to scroll progress
            var dist = getScrollDist();
            gsap.set(track, { x: -(self.progress * dist) });

            // Sync dot indicators to whichever card is most centred
            var cardW  = cards[0].offsetWidth + 28; // 28 = gap
            var active = Math.min(
                Math.round((self.progress * dist) / cardW),
                cards.length - 1
            );
            dots.forEach(function(d, i) { d.classList.toggle('active', i === active); });
        }
    });

    // Dot click: jump to that card's scroll position
    dots.forEach(function(d, i) {
        d.addEventListener('click', function() {
            var cardW    = cards[0].offsetWidth + 28;
            var target   = (i * cardW) / getScrollDist();
            var scrollTo = section.offsetTop + target * (getScrollDist() + window.innerHeight * 0.3);
            lenis.scrollTo(scrollTo, { duration: 1.2 });
        });
    });

    initImageCarousels();

    function initImageCarousels() {
        document.querySelectorAll('[data-carousel]').forEach(function(thumb) {
            if (thumb.querySelector('.project-dots')) return; // already initialised
            var innerTrack = thumb.querySelector('.project-track');
            var slides = innerTrack ? Array.from(innerTrack.children) : [];
            var card = thumb.closest('.arc-card');
            var cur = 0, tid;
            if (!innerTrack || slides.length < 2) return;

            var dc = document.createElement('div');
            dc.className = 'project-dots';
            var ddots = slides.map(function(_, i) {
                var dot = document.createElement('button');
                dot.className = 'project-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Slide ' + (i + 1));
                dot.addEventListener('click', function(e) { e.stopPropagation(); slideTo(i); });
                dc.appendChild(dot);
                return dot;
            });
            thumb.appendChild(dc);

            function slideTo(n) {
                cur = n;
                innerTrack.style.transform = 'translateX(-' + (cur * 100) + '%)';
                ddots.forEach(function(d, i) { d.classList.toggle('active', i === cur); });
            }
            function startSlide() {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                clearInterval(tid);
                tid = setInterval(function() { slideTo((cur + 1) % slides.length); }, 2500);
            }
            function stopSlide() { clearInterval(tid); slideTo(0); }

            if (card) {
                card.addEventListener('mouseenter', startSlide);
                card.addEventListener('mouseleave', stopSlide);
            }
        });
    }
}());
// ===== HERO PINNED CINEMATIC REVEAL =====
(function() {
    var hero    = document.querySelector('.hero');
    var label   = document.querySelector('.hero-label');
    var h1      = document.querySelector('.hero-content h1');
    var tagline = document.querySelector('.hero-content .tagline');
    var cta     = document.querySelector('.hero-cta');
    var scrollCue = document.querySelector('.scroll-cue');
    if (!hero || !h1) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobile  = window.innerWidth < 768;

    // --- MOBILE / REDUCED-MOTION: instant entrance, no pin ---
    if (mobile || reduced) {
        gsap.set([label, h1, tagline, cta], { opacity: 1, y: 0, scale: 1 });
        return;
    }

    // --- DESKTOP: pinned scroll-driven timeline ---
    // Set all hero elements to their start state
    gsap.set(label,   { opacity: 0, y: 18 });
    gsap.set(h1,      { opacity: 0, y: 64, scale: 0.94 });
    gsap.set(tagline, { opacity: 0, y: 22 });
    gsap.set(cta,     { opacity: 0, y: 18 });
    if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

    // Pin duration: 150vh of scroll distance drives the full sequence
    var tl = gsap.timeline({
        scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1.4,          // lag behind finger — feels weighted, not snappy
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });

    // Phase 1 — label fades in (0–15% of timeline)
    tl.to(label, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.15 }, 0);

    // Phase 1 — name scales + rises (5–40%)
    tl.to(h1, { opacity: 1, y: 0, scale: 1, ease: 'power3.out', duration: 0.35 }, 0.05);

    // Phase 2 — tagline slides up (35–60%)
    tl.to(tagline, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.25 }, 0.35);

    // Phase 3 — buttons pop in (55–80%)
    tl.to(cta, { opacity: 1, y: 0, ease: 'back.out(1.4)', duration: 0.25 }, 0.55);

    // Scroll cue fades in last (75–100%)
    if (scrollCue) {
        tl.to(scrollCue, { opacity: 1, ease: 'power1.out', duration: 0.2 }, 0.78);
    }

    // Subtle content drift upward as pin exits (parallax feel on unpin)
    var heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: '+=150%',
            scrub: 2,
            onUpdate: function(self) {
                // Only drift in the last 30% of the pin
                var drift = Math.max(0, (self.progress - 0.7) / 0.3) * -40;
                gsap.set(heroContent, { y: drift });
            }
        });
    }
}());

// CTA section scale-in
(function() {
    var cta = document.querySelector('.cta-section');
    if (!cta) return;
    gsap.fromTo(cta.querySelector('h2'),
        { opacity: 0, scale: 0.92 },
        {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: cta,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        }
    );
}());

// Active navigation link on scroll
window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(function(section) {
        if (pageYOffset >= section.offsetTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('nav a').forEach(function(link) {
        link.classList.remove('nav-active');
        const href = link.getAttribute('href');
        if (href && href.slice(1) === current) {
            link.classList.add('nav-active');
        }
    });

    // SCROLL PROGRESS BAR & BACK TO TOP BUTTON
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (totalHeight > 0) {
        const progressPercent = (window.pageYOffset / totalHeight) * 100;
        if (scrollProgress) {
            scrollProgress.style.width = progressPercent + '%';
        }
    }

    if (backToTopBtn) {
        if (window.pageYOffset > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
});

// Scroll to top functionality
document.getElementById('back-to-top')?.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Typewriter effect for hero role line
document.addEventListener('DOMContentLoaded', function() {
    const roles = [
        'Building AI-powered applications.',
        'Designing backend systems.',
        'Creating data-driven products.',
        'Turning ideas into software.'
    ];
    const el = document.getElementById('typed-role');
    if (!el) return;
    let ri = 0, ci = 0, deleting = false;

    function type() {
        const current = roles[ri];
        el.textContent = deleting ? current.slice(0, --ci) : current.slice(0, ++ci);
        if (!deleting && ci === current.length) {
            deleting = true;
            setTimeout(type, 1800);
            return;
        }
        if (deleting && ci === 0) {
            deleting = false;
            ri = (ri + 1) % roles.length;
        }
        setTimeout(type, deleting ? 38 : 72);
    }
    type();
});

// ===== HERO NAME CHAR SPLIT (absorbed into pin timeline above) =====
// Char split removed — scrub-based pin owns h1 animation.

// ===== PINNED HORIZONTAL SKILLS SCROLL (Technical Skills section only) =====
(function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var skillsSection = document.querySelector('#skills');
    if (!skillsSection) return;
    var wrap = skillsSection.querySelector('.skills-pin-wrap');
    var track = wrap && wrap.querySelector('.skills-h-track');
    if (!track || window.innerWidth < 768) return;

    var cards = track.querySelectorAll('.skill-card');
    gsap.set(cards, { opacity: 1, y: 0 });

    var scrollDist = track.scrollWidth - wrap.offsetWidth;
    if (scrollDist <= 0) return;

    gsap.to(track, {
        x: -scrollDist,
        ease: 'none',
        scrollTrigger: {
            trigger: skillsSection,
            start: 'top top',
            end: '+=' + (scrollDist + window.innerHeight * 0.5),
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    });
}());

// ===== WHAT I BUILD — staggered reveal, no pin =====
(function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var section = document.querySelector('#what-i-build');
    if (!section) return;
    var items = section.querySelectorAll('.service-item');
    if (!items.length) return;

    gsap.fromTo(items,
        { opacity: 0, y: 35 },
        {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: section,
                start: 'top 78%',
                toggleActions: 'play none none none'
            }
        }
    );
}());

// Portfolio view count via GoatCounter API
// Replace YOUR_CODE with your goatcounter site code
window.addEventListener('load', function() {
    var countElement = document.getElementById('portfolio-view-count');
    if (!countElement) return;

    fetch('https://sravankumar.goatcounter.com/counter//_.json')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            countElement.textContent = Number(data.count).toLocaleString();
        })
        .catch(function() {
            countElement.textContent = '\u2014';
        });
});