document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Simple Carousel Logic (Auto-scrolling for Social Proof if needed on mobile)
    const carouselTrack = document.querySelector('.carousel-track');

    if (carouselTrack) {
        // Ensure horizontal scrolling feels smooth on mobile
        const container = document.querySelector('.carousel-container');
        container.style.overflowX = 'auto';
        container.style.scrollSnapType = 'x mandatory';
        container.style.scrollbarWidth = 'none'; // Firefox
        container.style.msOverflowStyle = 'none';  // IE 10+

        const trackCards = document.querySelectorAll('.review-card');
        trackCards.forEach(card => card.style.scrollSnapAlign = 'start');
    }

    // 3. Smooth scrolling for anchor links with header offset
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70; // Map this to header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 4. Mobile Sticky CTA Visibility
    const stickyCta = document.querySelector('.mobile-sticky-cta');
    const heroSection = document.querySelector('.hero-section');
    const applySection = document.querySelector('#apply');

    if (stickyCta && heroSection) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Show sticky CTA when Hero section is NOT fully visible
                if (!entry.isIntersecting) {
                    stickyCta.classList.add('show');
                } else {
                    stickyCta.classList.remove('show');
                }
            });
        }, {
            root: null,
            threshold: 0.2 // Hide/Show when 20% of hero is visible
        });

        ctaObserver.observe(heroSection);

        // Hide CTA when Apply section is visible to avoid double CTA friction
        if (applySection) {
            const applyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        stickyCta.classList.remove('show');
                    } else if (window.scrollY > heroSection.offsetHeight * 0.8) {
                        // Re-show if we scrolled back up but are still below hero
                        stickyCta.classList.add('show');
                    }
                });
            }, {
                root: null,
                threshold: 0.1
            });
            applyObserver.observe(applySection);
        }
    }
});
