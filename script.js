/* =========================================================
   BRIGHT CAREER CONVENT HIGHER SECONDARY SCHOOL
   MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       LOADER
    ===================================================== */

    const loader = document.getElementById("loader");

    window.addEventListener("load", () => {
        setTimeout(() => {
            if (loader) {
                loader.classList.add("hidden");
            }
        }, 500);
    });


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.getElementById("header");

    function handleHeaderScroll() {

        if (!header) return;

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    window.addEventListener("scroll", handleHeaderScroll);

    handleHeaderScroll();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("active");

            const icon = menuToggle.querySelector("i");

            if (icon) {

                if (navLinks.classList.contains("active")) {

                    icon.classList.remove("fa-bars");
                    icon.classList.add("fa-xmark");

                    document.body.classList.add("no-scroll");

                } else {

                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");

                    document.body.classList.remove("no-scroll");
                }
            }
        });


        /* Close menu after clicking a link */

        const links = navLinks.querySelectorAll("a");

        links.forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("active");

                document.body.classList.remove("no-scroll");

                const icon = menuToggle.querySelector("i");

                if (icon) {
                    icon.classList.remove("fa-xmark");
                    icon.classList.add("fa-bars");
                }
            });

        });

    }


    /* =====================================================
       ACTIVE NAVIGATION LINK
    ===================================================== */

    const sections = document.querySelectorAll("section[id]");
    const navigationLinks = document.querySelectorAll(
        ".nav-links a[href^='#']"
    );


    function updateActiveNav() {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {
                currentSection = section.getAttribute("id");
            }

        });


        navigationLinks.forEach(link => {

            link.classList.remove("active");

            const target = link.getAttribute("href");

            if (target === `#${currentSection}`) {
                link.classList.add("active");
            }

        });

    }


    window.addEventListener("scroll", updateActiveNav);

    updateActiveNav();


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop = document.getElementById("backToTop");

    if (backToTop) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 500) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }

        });


        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* =====================================================
       FOOTER YEAR
    ===================================================== */

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* =====================================================
       COUNTER ANIMATION
    ===================================================== */

    const counters = document.querySelectorAll(".counter");

    let countersStarted = false;


    function startCounters() {

        if (countersStarted) return;

        if (!counters.length) return;

        const statsSection =
            document.querySelector(".stats-section");

        if (!statsSection) return;


        const sectionTop =
            statsSection.getBoundingClientRect().top;

        const screenHeight = window.innerHeight;


        if (sectionTop < screenHeight * 0.85) {

            countersStarted = true;


            counters.forEach(counter => {

                const target =
                    Number(counter.dataset.count) || 0;

                let current = 0;

                const duration = 1600;

                const startTime = performance.now();


                function updateCounter(currentTime) {

                    const elapsed =
                        currentTime - startTime;

                    const progress =
                        Math.min(elapsed / duration, 1);


                    const easedProgress =
                        1 - Math.pow(1 - progress, 3);


                    current =
                        Math.floor(
                            easedProgress * target
                        );


                    counter.textContent =
                        current.toLocaleString();


                    if (progress < 1) {

                        requestAnimationFrame(
                            updateCounter
                        );

                    } else {

                        counter.textContent =
                            target.toLocaleString();

                        /*
                         * Add + for larger achievement
                         * numbers.
                         */

                        if (target >= 100) {
                            counter.textContent =
                                target.toLocaleString() + "+";
                        }
                    }

                }


                requestAnimationFrame(updateCounter);

            });

        }

    }


    window.addEventListener(
        "scroll",
        startCounters
    );

    startCounters();


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".feature-card, " +
        ".info-card, " +
        ".facility-card, " +
        ".notice-card, " +
        ".why-item, " +
        ".gallery-item, " +
        ".contact-item"
    );


    revealElements.forEach(element => {
        element.classList.add("reveal");
    });


    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {
        revealObserver.observe(element);
    });


    /* =====================================================
       LOAD NOTICES FROM BACKEND
    ===================================================== */

    const noticeGrid =
        document.getElementById("noticeGrid");


    async function loadNotices() {

        if (!noticeGrid) return;


        try {

            const response =
                await fetch("/api/notices");


            if (!response.ok) {
                throw new Error(
                    "Unable to load notices"
                );
            }


            const notices =
                await response.json();


            if (!Array.isArray(notices) ||
                notices.length === 0) {

                noticeGrid.innerHTML = `
                    <div class="notice-empty">
                        <i class="fas fa-bell"></i>
                        <p>No notices available right now.</p>
                    </div>
                `;

                return;
            }


            noticeGrid.innerHTML =
                notices.map(notice => {

                    const date =
                        formatDate(
                            notice.created_at
                        );


                    return `
                        <article class="notice-card">

                            <div class="notice-icon">
                                <i class="fas fa-bell"></i>
                            </div>

                            <h3>
                                ${escapeHTML(
                                    notice.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    notice.description
                                )}
                            </p>

                            <span class="notice-date">
                                <i class="far fa-calendar"></i>
                                ${date}
                            </span>

                        </article>
                    `;

                }).join("");


            /*
             * Add reveal animation to newly
             * created notice cards.
             */

            const newNoticeCards =
                noticeGrid.querySelectorAll(
                    ".notice-card"
                );


            newNoticeCards.forEach(card => {

                card.classList.add("reveal");

                revealObserver.observe(card);

            });


        } catch (error) {

            console.error(
                "Notice loading error:",
                error
            );


            noticeGrid.innerHTML = `
                <div class="notice-error">

                    <i class="fas fa-triangle-exclamation"></i>

                    <p>
                        Unable to load notices.
                        Please try again later.
                    </p>

                </div>
            `;

        }

    }


    loadNotices();


    /* =====================================================
       CONTACT FORM
    ===================================================== */

    const contactForm =
        document.getElementById("contactForm");

    const contactMessage =
        document.getElementById("contactMessage");


    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const submitButton =
                    contactForm.querySelector(
                        ".submit-btn"
                    );


                const originalButtonHTML =
                    submitButton
                        ? submitButton.innerHTML
                        : "";


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.innerHTML = `
                        <span>Sending...</span>
                        <i class="fas fa-spinner fa-spin"></i>
                    `;

                }


                if (contactMessage) {

                    contactMessage.textContent = "";

                    contactMessage.className =
                        "form-message";

                }


                const formData =
                    new FormData(contactForm);


                const data = {

                    name:
                        formData.get("name"),

                    email:
                        formData.get("email"),

                    message:
                        formData.get("message")

                };


                try {

                    const response =
                        await fetch(
                            "/api/contact",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            result.message ||
                            "Unable to send message."
                        );

                    }


                    if (contactMessage) {

                        contactMessage.textContent =
                            result.message ||
                            "Your message has been received.";

                        contactMessage.classList.add(
                            "success"
                        );

                    }


                    contactForm.reset();


                } catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );


                    if (contactMessage) {

                        contactMessage.textContent =
                            error.message ||
                            "Something went wrong. Please try again.";

                        contactMessage.classList.add(
                            "error"
                        );

                    }

                } finally {

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.innerHTML =
                            originalButtonHTML;

                    }

                }

            }
        );

    }


    /* =====================================================
       GALLERY IMAGE PREVIEW
    ===================================================== */

    const galleryItems =
        document.querySelectorAll(
            ".gallery-item"
        );


    galleryItems.forEach(item => {

        item.addEventListener("click", () => {

            const image =
                item.querySelector("img");


            if (!image) return;


            openImagePreview(
                image.src,
                image.alt
            );

        });

    });


    function openImagePreview(
        imageSrc,
        imageAlt
    ) {

        const existing =
            document.getElementById(
                "imagePreview"
            );


        if (existing) {
            existing.remove();
        }


        const preview =
            document.createElement("div");


        preview.id = "imagePreview";

        preview.innerHTML = `
            <div class="image-preview-backdrop">

                <button
                    class="image-preview-close"
                    aria-label="Close image"
                >
                    <i class="fas fa-xmark"></i>
                </button>

                <img
                    src="${escapeAttribute(
                        imageSrc
                    )}"
                    alt="${escapeAttribute(
                        imageAlt
                    )}"
                >

            </div>
        `;


        /*
         * Temporary styles are inserted here so
         * the image viewer works without needing
         * another CSS file.
         */

        const style =
            document.createElement("style");


        style.id =
            "image-preview-styles";


        style.textContent = `

            #imagePreview {
                position: fixed;
                inset: 0;
                z-index: 99998;
            }

            .image-preview-backdrop {
                position: absolute;
                inset: 0;

                display: flex;
                align-items: center;
                justify-content: center;

                padding: 30px;

                background:
                    rgba(4, 9, 20, 0.92);

                backdrop-filter:
                    blur(10px);
            }

            .image-preview-backdrop img {
                max-width: 92vw;
                max-height: 88vh;

                object-fit: contain;

                border-radius: 14px;

                box-shadow:
                    0 30px 80px
                    rgba(0,0,0,0.45);

                animation:
                    imageZoom 0.25s ease;
            }

            .image-preview-close {
                position: absolute;

                top: 22px;
                right: 22px;

                width: 45px;
                height: 45px;

                display: flex;
                align-items: center;
                justify-content: center;

                color: white;

                background:
                    rgba(255,255,255,0.1);

                border:
                    1px solid
                    rgba(255,255,255,0.2);

                border-radius: 50%;

                font-size: 18px;

                cursor: pointer;

                z-index: 2;
            }

            .image-preview-close:hover {
                background:
                    rgba(255,255,255,0.2);
            }

            @keyframes imageZoom {

                from {
                    opacity: 0;
                    transform: scale(0.92);
                }

                to {
                    opacity: 1;
                    transform: scale(1);
                }

            }

        `;


        document.head.appendChild(style);

        document.body.appendChild(preview);

        document.body.classList.add(
            "no-scroll"
        );


        const closeButton =
            preview.querySelector(
                ".image-preview-close"
            );


        function closePreview() {

            preview.remove();

            document.body.classList.remove(
                "no-scroll"
            );

        }


        closeButton.addEventListener(
            "click",
            closePreview
        );


        preview
            .querySelector(
                ".image-preview-backdrop"
            )
            .addEventListener(
                "click",
                event => {

                    if (
                        event.target.classList
                            .contains(
                                "image-preview-backdrop"
                            )
                    ) {
                        closePreview();
                    }

                }
            );


        document.addEventListener(
            "keydown",
            function escapeHandler(event) {

                if (
                    event.key === "Escape"
                ) {

                    closePreview();

                    document.removeEventListener(
                        "keydown",
                        escapeHandler
                    );

                }

            }
        );

    }


    /* =====================================================
       SMOOTH SCROLL FOR INTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });


    /* =====================================================
       HELPER FUNCTIONS
    ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "Recent update";
        }


        const date =
            new Date(dateString);


        if (Number.isNaN(date.getTime())) {
            return "Recent update";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }


    function escapeHTML(value) {

        if (value === null ||
            value === undefined) {

            return "";

        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    /* =====================================================
       FINISHED
    ===================================================== */

    console.log(
        "Bright Career Convent website loaded successfully."
    );

});
/* =========================================================
   SMOOTH SCROLL + SCROLL REVEAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Smooth scrolling for navigation links */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* Scroll reveal observer */

    const revealElements = document.querySelectorAll(
        ".scroll-reveal, .scroll-left, .scroll-right, .scroll-scale, .reveal-card"
    );

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -60px 0px"
        }
    );


    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

});
