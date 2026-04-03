document.addEventListener('DOMContentLoaded', () => {
    // 0. UTM Parameter Capture & Preservation
    const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const UTM_STORAGE_KEY = 'utm_params';

    function captureUtmParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmFromUrl = {};
        let hasUtm = false;
        UTM_KEYS.forEach(key => {
            const val = urlParams.get(key);
            if (val) { utmFromUrl[key] = val; hasUtm = true; }
        });
        if (hasUtm) {
            sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmFromUrl));
        }
    }

    function getStoredUtm() {
        try {
            return JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY)) || {};
        } catch { return {}; }
    }

    function appendUtmToUrl(url) {
        const utm = getStoredUtm();
        if (Object.keys(utm).length === 0) return url;
        const u = new URL(url);
        Object.entries(utm).forEach(([k, v]) => u.searchParams.set(k, v));
        return u.toString();
    }

    function getUtmEventParams() {
        const utm = getStoredUtm();
        const mapping = {
            utm_source: 'campaign_source',
            utm_medium: 'campaign_medium',
            utm_campaign: 'campaign_name',
            utm_content: 'campaign_content',
            utm_term: 'campaign_term'
        };
        const params = {};
        Object.entries(utm).forEach(([k, v]) => {
            if (mapping[k]) params[mapping[k]] = v;
        });
        return params;
    }

    captureUtmParams();
    window.getUtmEventParams = getUtmEventParams;

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

    // 2-1. Form Modal Banner Slider
    (function () {
        const track = document.querySelector('.form-modal-banner-track');
        const dots = document.querySelectorAll('.banner-dot');
        if (!track || !dots.length) return;
        let current = 0;
        const total = dots.length;
        let interval;

        function goTo(idx) {
            current = idx;
            track.style.transform = 'translateX(-' + (current * 100) + '%)';
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }

        function startAuto() {
            interval = setInterval(function () { goTo((current + 1) % total); }, 3500);
        }

        function stopAuto() { clearInterval(interval); }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                stopAuto();
                goTo(Number(this.dataset.index));
                startAuto();
            });
        });

        startAuto();
    })();

    // 3. Form Modal Open/Close
    const formModal = document.getElementById('form-modal');
    const formModalClose = document.getElementById('form-modal-close');
    const formModalBack = document.getElementById('form-modal-back');

    function openFormModal(e) {
        if (e) e.preventDefault();
        formModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Push history state for mobile back button
        history.pushState({ formModal: true }, '');
    }

    function closeFormModal() {
        formModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Open modal from all CTA buttons
    document.querySelectorAll('.open-form-modal').forEach(btn => {
        btn.addEventListener('click', openFormModal);
    });

    // Close via X button (desktop) or back button (mobile)
    if (formModalClose) formModalClose.addEventListener('click', closeFormModal);
    if (formModalBack) formModalBack.addEventListener('click', function () {
        history.back();
    });

    // Close on overlay click (desktop only)
    if (formModal) formModal.addEventListener('click', function (e) {
        if (e.target === formModal) closeFormModal();
    });

    // Handle browser back button (mobile)
    window.addEventListener('popstate', function (e) {
        if (formModal && formModal.style.display === 'flex') {
            closeFormModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && formModal && formModal.style.display === 'flex') {
            closeFormModal();
        }
    });

    // 3-1. Terms Modal Open/Close
    const termsModal = document.getElementById('terms-modal');
    const termsModalTitle = document.getElementById('terms-modal-title');
    const termsModalClose = document.getElementById('terms-modal-close');
    const termsModalBack = document.getElementById('terms-modal-back');
    const termsModalConfirm = document.getElementById('terms-modal-confirm');

    const termsConfig = {
        refund: { title: '환불 규정', contentId: 'terms-content-refund' },
        privacy: { title: '개인정보 수집 및 이용 동의', contentId: 'terms-content-privacy' },
    };

    function openTermsModal(type) {
        const config = termsConfig[type];
        if (!config || !termsModal) return;

        // Hide all contents, show selected
        Object.values(termsConfig).forEach(c => {
            const el = document.getElementById(c.contentId);
            if (el) el.style.display = 'none';
        });
        const contentEl = document.getElementById(config.contentId);
        if (contentEl) contentEl.style.display = 'block';

        termsModalTitle.textContent = config.title;
        termsModal.style.display = 'flex';
        termsModal.querySelector('.terms-modal-body').scrollTop = 0;
    }

    function closeTermsModal() {
        if (termsModal) termsModal.style.display = 'none';
    }

    // Terms link click handlers
    document.querySelectorAll('.terms-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent checkbox toggle
            openTermsModal(this.dataset.terms);
        });
    });

    if (termsModalClose) termsModalClose.addEventListener('click', closeTermsModal);
    if (termsModalBack) termsModalBack.addEventListener('click', closeTermsModal);
    if (termsModalConfirm) termsModalConfirm.addEventListener('click', closeTermsModal);

    // Close on overlay click
    if (termsModal) termsModal.addEventListener('click', function (e) {
        if (e.target === termsModal) closeTermsModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && termsModal && termsModal.style.display === 'flex') {
            closeTermsModal();
        }
    });

    // 4. TossPayments + Workshop Application Form
    // API 개별 연동 키 (카드 결제창)
    const TOSS_CLIENT_KEY = 'live_ck_QbgMGZzorzq4JxKw40RDVl5E1em4';
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw12ngoJI7v-Pm0lDcbXDgc8jI9tYz3m8O2Qgz3ig79D9L2Pl4n-cXOM4ef-Gyo081s/exec';

    // 주문번호 생성 함수
    function generateOrderId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'WS-';
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 페이지 로드 시 결제 성공 콜백 처리
    (function handlePaymentCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amount = urlParams.get('amount');

        if (paymentKey && orderId && amount) {
            const savedData = sessionStorage.getItem('workshop_form_data');
            if (savedData) {
                const formData = JSON.parse(savedData);
                sessionStorage.removeItem('workshop_form_data');

                // Vercel API로 결제 승인 요청
                fetch('/api/confirm-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
                })
                .then(res => {
                    console.log('[Payment] confirm-payment response status:', res.status);
                    return res.json();
                })
                .then(data => {
                    console.log('[Payment] confirm-payment response data:', data);
                    if (data.status === 'DONE') {
                        // 결제 승인 완료 → Google Apps Script로 폼 데이터 전송
                        fetch(APPS_SCRIPT_URL, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...formData,
                                paymentKey,
                                orderId,
                                amount,
                                paymentStatus: 'paid'
                            })
                        });

                        gtag('event', 'purchase', Object.assign({
                            event_category: 'conversion',
                            event_label: 'workshop_payment',
                            workshop_date: formData.schedule,
                            transaction_id: orderId,
                            value: 100000,
                            currency: 'KRW'
                        }, getUtmEventParams()));

                        if (typeof fbq === 'function') {
                            fbq('track', 'Purchase', {
                                content_name: 'workshop_payment',
                                value: 100000,
                                currency: 'KRW'
                            });
                        }

                        const modal = document.getElementById('thank-you-modal');
                        if (modal) {
                            modal.querySelector('.modal-schedule').textContent = formData.schedule;
                            modal.style.display = 'flex';
                            document.body.style.overflow = 'hidden';
                        }
                    } else {
                        console.error('[Payment] Confirm failed:', data);
                        alert('결제 승인에 실패했습니다.\n오류: ' + (data.error || data.code || 'Unknown') + '\n주문번호: ' + orderId);
                    }
                })
                .catch((err) => {
                    console.error('[Payment] Confirm request error:', err);
                    alert('결제 승인 처리 중 오류가 발생했습니다.\n' + err.message + '\n주문번호: ' + orderId);
                });
            }

            window.history.replaceState({}, '', window.location.pathname);
        }

        // 결제 실패 처리
        const errorCode = urlParams.get('code');
        const errorMessage = urlParams.get('message');
        if (errorCode) {
            setTimeout(() => {
                alert('결제에 실패했습니다: ' + (errorMessage || errorCode) + '\n다시 시도해주세요.');
            }, 300);
            window.history.replaceState({}, '', window.location.pathname);
        }
    })();

    const workshopForm = document.getElementById('workshop-form');
    if (workshopForm) {
        let isSubmitting = false;

        workshopForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (isSubmitting) return;

            // Clear previous errors
            document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
            const errorEl = document.getElementById('form-error');
            errorEl.style.display = 'none';

            // Collect form data
            const name = document.getElementById('form-name').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const affiliation = document.getElementById('form-affiliation').value.trim();
            const scheduleEl = document.querySelector('input[name="schedule"]:checked');
            const message = document.getElementById('form-message').value.trim();
            const refundAgree = document.querySelector('input[name="refund_agree"]').checked;
            const privacyAgree = document.querySelector('input[name="privacy_agree"]').checked;

            // Validation
            const errors = [];
            if (!name) { errors.push('성함을 입력해주세요.'); markError('form-name'); }
            if (!phone) { errors.push('연락처를 입력해주세요.'); markError('form-phone'); }
            if (!affiliation) { errors.push('소속을 입력해주세요.'); markError('form-affiliation'); }
            if (!scheduleEl) { errors.push('참석 희망 일정을 선택해주세요.'); }
            if (!refundAgree) { errors.push('환불 규정에 동의해주세요.'); }
            if (!privacyAgree) { errors.push('개인정보 수집에 동의해주세요.'); }

            if (errors.length > 0) {
                errorEl.textContent = errors[0];
                errorEl.style.display = 'block';
                return;
            }

            const schedule = scheduleEl.value;

            gtag('event', 'form_start', Object.assign({
                event_category: 'engagement',
                event_label: 'workshop_form'
            }, getUtmEventParams()));

            gtag('event', 'workshop_apply_click', Object.assign({
                event_category: 'engagement',
                event_label: 'apply_section_form'
            }, getUtmEventParams()));

            // Show loading state
            isSubmitting = true;
            const submitBtn = document.getElementById('form-submit');
            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').style.display = 'none';
            submitBtn.querySelector('.btn-loading').style.display = 'inline';

            try {
                // 폼 데이터를 sessionStorage에 저장 (결제 성공 후 복원용)
                const formData = { name, phone, affiliation, schedule, message, refundAgree, privacyAgree, ...getStoredUtm() };
                sessionStorage.setItem('workshop_form_data', JSON.stringify(formData));

                // 토스페이먼츠 결제 요청
                const tossPayments = TossPayments(TOSS_CLIENT_KEY);
                const payment = tossPayments.payment({
                    customerKey: TossPayments.ANONYMOUS,
                });

                const orderId = generateOrderId();
                const currentOrigin = window.location.origin;
                const currentPath = window.location.pathname;
                const baseSuccessUrl = currentOrigin + currentPath + '?status=success';
                const baseFailUrl = currentOrigin + currentPath + '?status=fail';

                await payment.requestPayment({
                    method: 'CARD',
                    amount: {
                        currency: 'KRW',
                        value: 100000,
                    },
                    orderId: orderId,
                    orderName: 'Next Genogram 심화 워크숍 (' + schedule + ')',
                    customerName: name,
                    customerMobilePhone: phone.replace(/-/g, ''),
                    successUrl: appendUtmToUrl(baseSuccessUrl),
                    failUrl: appendUtmToUrl(baseFailUrl),
                });

            } catch (err) {
                console.error('[Payment] requestPayment error:', { code: err.code, message: err.message, err });
                if (err.code === 'USER_CANCEL') {
                    console.log('[Payment] User cancelled payment');
                } else {
                    errorEl.textContent = '결제 요청 중 오류가 발생했습니다: ' + (err.message || '잠시 후 다시 시도해주세요.');
                    errorEl.style.display = 'block';
                }
                sessionStorage.removeItem('workshop_form_data');
            } finally {
                isSubmitting = false;
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').style.display = 'inline';
                submitBtn.querySelector('.btn-loading').style.display = 'none';
            }
        });

        function markError(inputId) {
            const input = document.getElementById(inputId);
            if (input) input.closest('.form-group').classList.add('has-error');
        }
    }

    // 4. Smooth scrolling for anchor links with header offset
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
