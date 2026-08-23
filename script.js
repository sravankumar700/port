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

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Auto-advance carousel on project card thumbnails
document.querySelectorAll('[data-carousel]').forEach(function(thumb) {
    const track = thumb.querySelector('.project-track');
    const slides = track ? Array.from(track.children) : [];
    const card = thumb.closest('.project-card');
    let current = 0;
    let intervalId;

    if (!track || slides.length < 2) return;

    // Build dot indicators
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'project-dots';
    const dots = slides.map(function(_, i) {
        const dot = document.createElement('button');
        dot.className = 'project-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            goTo(i);
        });
        dotsContainer.appendChild(dot);
        return dot;
    });
    thumb.appendChild(dotsContainer);

    function goTo(index) {
        current = index;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
    }

    function next() { goTo((current + 1) % slides.length); }

    function start() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        clearInterval(intervalId);
        intervalId = setInterval(next, 2500);
    }

    function stop() {
        clearInterval(intervalId);
        goTo(0);
    }

    if (card) {
        card.addEventListener('mouseenter', start);
        card.addEventListener('mouseleave', stop);
    }
});

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