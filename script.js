document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Simple Step-Based Infinite Carousel
    function initCarousel(wrapperId, trackId, prevId, nextId, autoPlayMs) {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) { console.warn('Carousel wrapper not found:', wrapperId); return; }

        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevId);
        const nextBtn = document.getElementById(nextId);

        if (!track) { console.warn('Track not found:', trackId); return; }

        const originalItems = Array.from(track.children);
        const totalOriginal = originalItems.length;
        if (totalOriginal === 0) return;

        // Clone items 3x for a large buffer
        for (let i = 0; i < 3; i++) {
            originalItems.forEach(item => {
                track.appendChild(item.cloneNode(true));
            });
        }

        let currentIndex = totalOriginal; // Start at the first clone set
        let isAnimating = false;
        let autoTimer = null;

        function getItemWidth() {
            const firstItem = track.children[0];
            if (!firstItem) return 0;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 30;
            return firstItem.offsetWidth + gap;
        }

        function jumpTo(index, animate) {
            if (animate) {
                track.style.transition = 'transform 0.45s ease-out';
            } else {
                track.style.transition = 'none';
            }
            const offset = index * getItemWidth();
            track.style.transform = 'translateX(-' + offset + 'px)';
        }

        function goNext() {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex++;
            jumpTo(currentIndex, true);

            setTimeout(() => {
                if (currentIndex >= totalOriginal * 3) {
                    currentIndex -= totalOriginal;
                    jumpTo(currentIndex, false);
                }
                isAnimating = false;
            }, 460);
        }

        function goPrev() {
            if (isAnimating) return;
            isAnimating = true;
            currentIndex--;
            jumpTo(currentIndex, true);

            setTimeout(() => {
                if (currentIndex < totalOriginal) {
                    currentIndex += totalOriginal;
                    jumpTo(currentIndex, false);
                }
                isAnimating = false;
            }, 460);
        }

        // Initial position (no animation)
        jumpTo(currentIndex, false);

        // Button click handlers
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                stopAuto();
                goNext();
                startAuto();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                stopAuto();
                goPrev();
                startAuto();
            });
        }

        // Auto play
        function startAuto() {
            stopAuto();
            if (autoPlayMs > 0) {
                autoTimer = setInterval(goNext, autoPlayMs);
            }
        }

        function stopAuto() {
            if (autoTimer) {
                clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        // Pause on hover
        wrapper.addEventListener('mouseenter', stopAuto);
        wrapper.addEventListener('mouseleave', startAuto);

        startAuto();
    }

    // Initialize Social Proof carousel (auto-play every 3s)
    initCarousel('review-carousel-wrapper', 'review-track', 'review-prev', 'review-next', 3000);

    // Initialize Gallery carousel (auto-play every 4s)
    initCarousel('gallery-carousel-wrapper', 'gallery-track', 'gallery-prev', 'gallery-next', 4000);

    // 3. Smooth scrolling for anchor links with header offset
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 70;
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
