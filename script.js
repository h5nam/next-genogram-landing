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
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
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
});
