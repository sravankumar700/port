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

// Active navigation link on scroll
window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--accent)';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const countElement = document.getElementById('portfolio-view-count');
    const counterKey = 'portfolio-page-view-recorded';

    if (!countElement || typeof Counter !== 'function') {
        return;
    }

    try {
        const counter = new Counter({ workspace: 'sravan-kumar-portfolio' });
        const hasRecordedVisit = sessionStorage.getItem(counterKey) === 'true';
        const request = hasRecordedVisit ? counter.get('page-views') : counter.up('page-views');

        request.then(function(result) {
            const count = Number(result.value);
            if (!Number.isFinite(count)) {
                throw new Error('Invalid counter response');
            }
            countElement.textContent = count.toLocaleString();
            if (!hasRecordedVisit) {
                sessionStorage.setItem(counterKey, 'true');
            }
        }).catch(function() {
            countElement.textContent = '\u2014';
        });
    } catch (error) {
        countElement.textContent = '\u2014';
    }
});