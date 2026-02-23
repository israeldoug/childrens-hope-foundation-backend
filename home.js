
document.addEventListener('DOMContentLoaded', function () {
    const carouselContainer = document.querySelector('.about-carousel');

    // First, check if the carousel actually exists on the page to avoid errors
    if (carouselContainer) {
        const carouselInner = carouselContainer.querySelector('.about-carousel-inner');
        const images = carouselInner.querySelectorAll('img');
        const total = images.length;
        let currentIndex = 1; // Start at the first "real" image
        let autoSlideInterval = null;

        // Init dimensions
        carouselInner.style.width = `${total * 100}%`;
        images.forEach(img => img.style.width = `${100 / total}%`);

        function showImage(index, instant = false) {
            carouselInner.style.transition = instant ? 'none' : 'transform 0.5s ease-in-out';
            const offset = -index * (100 / total);
            carouselInner.style.transform = `translateX(${offset}%)`;
        }

        function autoAdvance() {
            currentIndex++;
            showImage(currentIndex);
            if (currentIndex === total - 1) {
                setTimeout(() => {
                    currentIndex = 1;
                    showImage(currentIndex, true);
                }, 500);
            }
        }

        const startAutoSlide = () => {
            if (!autoSlideInterval) autoSlideInterval = setInterval(autoAdvance, 3000);
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        };

        // Controls
        const prevBtn = carouselContainer.querySelector('.carousel-control.prev');
        const nextBtn = carouselContainer.querySelector('.carousel-control.next');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                autoAdvance();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                currentIndex--;
                showImage(currentIndex);
                if (currentIndex === 0) {
                    setTimeout(() => {
                        currentIndex = total - 2;
                        showImage(currentIndex, true);
                    }, 500);
                }
                startAutoSlide();
            });
        }

        // IntersectionObserver for Pause/Play
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.isIntersecting ? startAutoSlide() : stopAutoSlide();
            });
        }, { threshold: 0.2 });
        aboutObserver.observe(carouselContainer);

        // Init
        showImage(currentIndex, true);
    }

    // B. "Fund a Need" Carousels (Simple Fade/Switch)
    const fundCarousels = document.querySelectorAll('.fund-goal-carousel');
    const setupFundCarousel = (carousel) => {
        const images = carousel.querySelectorAll('img');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let current = 0;
        let intervalId = null;

        function showImage(idx) {
            images.forEach((img, i) => img.classList.toggle('active', i === idx));
        }

        function nextImage() {
            current = (current + 1) % images.length;
            showImage(current);
        }

        function prevImage() {
            current = (current - 1 + images.length) % images.length;
            showImage(current);
        }

        function start() {
            if (!intervalId) intervalId = setInterval(nextImage, 5000);
        }

        function stop() {
            clearInterval(intervalId);
            intervalId = null;
        }

        if (prevBtn) prevBtn.onclick = prevImage;
        if (nextBtn) nextBtn.onclick = nextImage;

        carousel.start = start;
        carousel.stop = stop;
        showImage(current);
    };

    const fundObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.start && entry.target.stop) {
                entry.isIntersecting ? entry.target.start() : entry.target.stop();
            }
        });
    }, { threshold: 0.5 });

    fundCarousels.forEach(c => {
        setupFundCarousel(c);
        fundObserver.observe(c);
    });


    // --- 2. SCROLL ANIMATION (Sections) ---
    const scrollSections = document.querySelectorAll('.scroll-animate');
    if (scrollSections.length > 0) {
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });

        scrollSections.forEach(section => scrollObserver.observe(section));
    }



    // Utility for easing
    function easeOutQuad(t) {
        return t * (2 - t);
    }

    // --- 3. DYNAMIC COUNTER ANIMATION ---
    const impactSnapshot = document.querySelector('.impact-snapshot');
    if (impactSnapshot) {
        let hasAnimated = false;

        function animateNumbers() {
            const statNumbers = document.querySelectorAll('.impact-snapshot .stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'), 10);
                const duration = 2000;
                let startTime = null;

                stat.textContent = '0';

                function animate(currentTime) {
                    if (!startTime) startTime = currentTime;
                    const progress = (currentTime - startTime) / duration;

                    if (progress < 1) {
                        const currentNumber = Math.ceil(easeOutQuad(progress) * target);

                        // Formatting
                        let formatted = currentNumber.toLocaleString();

                        if (target === 3000) formatted = '+' + formatted;
                        else if (target === 100) formatted += '+';

                        stat.textContent = formatted;
                        requestAnimationFrame(animate);
                    } else {
                        // Formatting Final
                        let formatted = target.toLocaleString();
                        if (target === 3000) formatted = '+' + formatted;
                        else if (target === 100) formatted += '+';
                        stat.textContent = formatted;
                    }
                }
                requestAnimationFrame(animate);
            });
        }

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated) {
                    animateNumbers();
                    hasAnimated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counterObserver.observe(impactSnapshot);
    }


    // --- 4. NAVIGATION LOGIC ---

    // Smooth Scroll & Active State
    const navLinks = document.querySelectorAll('.main-nav a');
    const homeLink = document.getElementById('home-link');
    const hamburger = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('mainNav');

    // Close menu helper
    function closeMenu() {
        if (mainNav.classList.contains('open')) {
            mainNav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.classList.remove('open');
        }
    }

    // Click handling
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Handle internal links
            if (href.startsWith('#')) {
                e.preventDefault();
                closeMenu();

                // Special case for top
                if (href === '#top') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    history.replaceState(null, '', '#top');
                } else {
                    const target = document.querySelector(href);
                    if (target) {
                        window.scrollTo({
                            top: target.offsetTop - 60,
                            behavior: 'smooth'
                        });
                        history.replaceState(null, '', href);
                    }
                }

                // Set active immediately
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Home Logo Text Click
    const logoLink = document.getElementById('home-logo');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.replaceState(null, '', '#top');
            navLinks.forEach(l => l.classList.remove('active'));
            if (homeLink) homeLink.classList.add('active');
        });
    }

    // Hamburger Toggle
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent document click from immediately closing it
            this.classList.toggle('open');
            mainNav.classList.toggle('open');
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
        });

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // Scroll Spy (Highlight Active Nav) - Optimized with IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const navLinksMap = {};
    document.querySelectorAll('.main-nav a[data-section]').forEach(link => {
        navLinksMap[link.getAttribute('data-section')] = link;
    });

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));

                // Add active to current
                const id = entry.target.getAttribute('id');
                if (navLinksMap[id]) {
                    navLinksMap[id].classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px' // Trigger when section is in the middle of screen
    });

    sections.forEach(section => scrollSpyObserver.observe(section));

    // Handle Home/Top separately — throttled with rAF
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(() => {
                if (window.scrollY < 100) {
                    document.querySelectorAll('.main-nav a').forEach(l => l.classList.remove('active'));
                    if (homeLink) homeLink.classList.add('active');
                }
                scrollTicking = false;
            });
        }
    }, { passive: true });


    // --- 5. MODAL LOGIC ---
    const impactCards = document.querySelectorAll('.impact-item');
    const modalOverlay = document.getElementById('impact-modal-overlay');

    if (impactCards.length > 0 && modalOverlay) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeModalBtn = document.getElementById('modal-close-btn');

        const openModal = (card) => {
            const title = card.querySelector('h3').innerText;
            const hiddenDetails = card.querySelector('.impact-full-details');

            let fullDescription = '';

            if (hiddenDetails) {
                // Use the detailed content if available
                fullDescription = hiddenDetails.innerHTML;
            } else {
                // Fallback to existing paragraphs (legacy support)
                const paragraphs = card.querySelectorAll('p');
                paragraphs.forEach(p => fullDescription += `<p>${p.innerHTML}</p>`);
            }

            modalTitle.innerText = title;
            modalBody.innerHTML = fullDescription;
            modalOverlay.classList.add('active');
            document.body.classList.add('modal-open');

            // Focus management
            const closeBtn = modalOverlay.querySelector('.modal-close-button');
            if (closeBtn) closeBtn.focus();

            // Handle Escape key
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        };

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('modal-open');
        };

        impactCards.forEach(card => {
            const btn = card.querySelector('.read-more-button');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal(card);
                });
            }
        });

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- 6. NEWSLETTER SUBSCRIPTION ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput ? emailInput.value : '';

            if (!email) {
                showNotification('Please enter your email address.', 'error');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }

            fetch('http://localhost:3000/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            }).then(response => {
                showNotification('Thank you for subscribing!', 'success');
                if (response.ok) {
                    emailInput.value = '';
                }
            }).catch(err => {
                console.error('Newsletter error:', err);
                showNotification('Thank you for subscribing!', 'success');
                emailInput.value = '';
            });
        });
    }

});