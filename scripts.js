document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Hero Animations ---
    const heroTimeline = gsap.timeline();

    heroTimeline
        .from('#hero h1', {
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: 'power4.out',
            delay: 0.2
        })
        .from('#hero p', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        }, "-=0.8")
        .from('.hero-btn', { // Added class to buttons in HTML update
            y: 20,
            autoAlpha: 0, // Use autoAlpha instead of opacity for better visibility handling
            stagger: 0.2,
            duration: 0.8,
            ease: 'back.out(1.7)',
            clearProps: 'opacity,visibility' // Ensure it stays visible after animation
        }, "-=0.6")
        .from('#hero img', {
            x: 50,
            opacity: 0,
            duration: 1.5,
            ease: 'power4.out'
        }, "-=1.0");

    // --- 2. Stats Counter Animation ---
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        gsap.to(counter, {
            innerHTML: target,
            duration: 2.5,
            snap: { innerHTML: 1 },
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '#hero',
                start: 'top 60%', // Trigger earlier
            },
            onUpdate: function () {
                counter.innerHTML = '+' + Math.ceil(this.targets()[0].innerHTML);
            }
        });
    });

    // --- 3. Typing Effect (Fixed) ---
    const words = ["para casamentos", "para 15 anos", "para sua festa!"];
    const typingElement = document.getElementById("typing-text");
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing if element exists
    if (typingElement) type();


    // --- 4. Scroll Reveals (Batching for performance) ---
    ScrollTrigger.batch(".glass-card", {
        start: "top 85%",
        onEnter: batch => {
            // Animate cards
            gsap.to(batch, {
                y: 0,
                opacity: 1,
                stagger: 0.15,
                duration: 0.8,
                ease: "power2.out"
            });
            // Animate Icons inside the cards (Scale Up + Fade In)
            gsap.from(batch.map(card => card.querySelector('.icon-animate')), {
                scale: 0.5,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "back.out(1.7)",
                delay: 0.2
            });
        },
        // Ensure they are hidden initially via CSS or handling here:
        onEnterBack: batch => gsap.to(batch, { opacity: 1, y: 0 }),
    });

    // --- 5. FAQ Logic ---
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const btn = item.querySelector('button');
            const isActive = answer.style.maxHeight;

            // Close all others
            document.querySelectorAll('.faq-answer').forEach(el => el.style.maxHeight = null);
            document.querySelectorAll('.faq-item button').forEach(el => el.style.transform = 'rotate(0deg)');

            if (!isActive) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                btn.style.transform = 'rotate(45deg)';
            }
        });
    });

    // --- 6. Simple Particles System ---
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');

    if (heroSection) {
        // Place canvas behind everything in hero
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1'; // Behind text (z-20) but above bg (z-0)
        canvas.style.pointerEvents = 'none';
        heroSection.appendChild(canvas);

        let particles = [];
        const particleCount = 50;

        function resize() {
            canvas.width = heroSection.offsetWidth;
            canvas.height = heroSection.offsetHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                this.alpha = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 215, 0, ${this.alpha})`; // Gold dust
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // --- 7. Testimonials Carousel ---
    const track = document.getElementById('testimonials-track');
    if (track) {
        const cards = Array.from(track.children);
        let currentIndex = 0;
        let slideInterval;

        function updateCarousel() {
            const cardWidth = cards[0].offsetWidth;
            // Determine how many cards are visible based on container width vs card width
            // But since CSS defines 100% or 50%, we can infer:
            const visibleCards = window.innerWidth >= 768 ? 2 : 1;
            const maxIndex = cards.length - visibleCards;

            gsap.to(track, {
                x: -currentIndex * cardWidth,
                duration: 0.5,
                ease: "power2.inOut"
            });
        }

        function nextSlide() {
            const visibleCards = window.innerWidth >= 768 ? 2 : 1;
            const maxIndex = cards.length - visibleCards;

            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0; // Loop back to start
            }
            updateCarousel();
        }

        // Auto-play
        function startAutoPlay() {
            slideInterval = setInterval(nextSlide, 4000); // 4 seconds per slide
        }

        function stopAutoPlay() {
            clearInterval(slideInterval);
        }

        // Event Listeners
        window.addEventListener('resize', () => {
            // Recalculate position on resize
            updateCarousel();
        });

        // Pause on hover
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);

        // Init
        startAutoPlay();
    }
});
