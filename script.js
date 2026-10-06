/* =========================
   MOBILE MENU
========================= */

function toggleMenu() {
    const nav = document.querySelector("nav");

    if (nav) {
        nav.classList.toggle("active");
    }
}


/* =========================
   SCROLL ANIMATIONS
========================= */

const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

            }

        });

    },
    {
        threshold: 0.12
    }
);


document.querySelectorAll(".reveal").forEach(element => {
    observer.observe(element);
});


/* =========================
   COUNTERS
========================= */

function animateCounter(element) {

    const target = Number(
        element.dataset.number
    );

    let current = 0;

    const duration = 1500;

    const start = performance.now();

    function update(time) {

        const progress = Math.min(
            (time - start) / duration,
            1
        );

        current = Math.floor(
            progress * target
        );

        element.textContent =
            current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }

    }

    requestAnimationFrame(update);
}


const counterObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (
                entry.isIntersecting &&
                !entry.target.dataset.animated
            ) {

                entry.target.dataset.animated = "true";

                animateCounter(entry.target);

            }

        });

    },
    {
        threshold: .5
    }
);


document
    .querySelectorAll("[data-number]")
    .forEach(counter => {
        counterObserver.observe(counter);
    });


/* =========================
   LOAD NOTICES
========================= */

async function loadNotices() {

    const container =
        document.getElementById("notices");

    if (!container) return;

    try {

        const response =
            await fetch("/api/notices");

        const notices =
            await response.json();

        container.innerHTML = "";

        notices.forEach(notice => {

            const card =
                document.createElement("div");

            card.className =
                "notice-card reveal visible";

            const date =
                new Date(notice.created_at)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );

            card.innerHTML = `
                <div class="date">
                    ${date}
                </div>

                <h3>
                    ${escapeHTML(notice.title)}
                </h3>

                <p>
                    ${escapeHTML(notice.description)}
                </p>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        container.innerHTML = `
            <div class="notice-card">
                Unable to load notices.
            </div>
        `;

    }
}


loadNotices();


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value;

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const message =
                document.getElementById(
                    "loginMessage"
                );

            message.textContent =
                "Signing in...";

            try {

                const response =
                    await fetch(
                        "/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message
                    );
                }

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                message.style.color =
                    "#16834a";

                message.textContent =
                    "Login successful!";

                setTimeout(() => {
                    window.location.href =
                        "dashboard.html";
                }, 700);

            } catch (error) {

                message.style.color =
                    "#e43f3f";

                message.textContent =
                    error.message;

            }

        }
    );

}


/* =========================
   REGISTER
========================= */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "registerName"
                ).value;

            const email =
                document.getElementById(
                    "registerEmail"
                ).value;

            const password =
                document.getElementById(
                    "registerPassword"
                ).value;

            const message =
                document.getElementById(
                    "registerMessage"
                );

            message.textContent =
                "Creating account...";

            try {

                const response =
                    await fetch(
                        "/api/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message
                    );
                }

                message.style.color =
                    "#16834a";

                message.textContent =
                    "Account created! You can now login.";

                registerForm.reset();

                setTimeout(() => {
                    showLogin();
                }, 1000);

            } catch (error) {

                message.style.color =
                    "#e43f3f";

                message.textContent =
                    error.message;

            }

        }
    );

}


/* =========================
   LOGIN TABS
========================= */

function showLogin() {

    const login =
        document.getElementById(
            "loginForm"
        );

    const register =
        document.getElementById(
            "registerForm"
        );

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const registerTab =
        document.getElementById(
            "registerTab"
        );

    if (!login) return;

    login.classList.remove("hidden");

    register.classList.add("hidden");

    loginTab.classList.add("active");

    registerTab.classList.remove("active");
}


function showRegister() {

    const login =
        document.getElementById(
            "loginForm"
        );

    const register =
        document.getElementById(
            "registerForm"
        );

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const registerTab =
        document.getElementById(
            "registerTab"
        );

    if (!login) return;

    login.classList.add("hidden");

    register.classList.remove("hidden");

    loginTab.classList.remove("active");

    registerTab.classList.add("active");
}


/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href =
            "login.html";

        return;
    }

    try {

        const response =
            await fetch(
                "/api/dashboard",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            localStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

            return;
        }

        const data =
            await response.json();

        const nameElement =
            document.getElementById(
                "studentName"
            );

        if (nameElement) {
            nameElement.textContent =
                data.student.name;
        }

        const container =
            document.getElementById(
                "dashboardNotices"
            );

        if (!container) return;

        container.innerHTML = "";

        data.notices.forEach(notice => {

            const card =
                document.createElement("div");

            card.className =
                "notice-card";

            card.innerHTML = `
                <div class="date">
                    SCHOOL NOTICE
                </div>

                <h3>
                    ${escapeHTML(notice.title)}
                </h3>

                <p>
                    ${escapeHTML(notice.description)}
                </p>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(error);

    }
}


/* =========================
   LOGOUT
========================= */

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";
}


/* =========================
   CONTACT
========================= */

const contactForm =
    document.getElementById(
        "contactForm"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "contactName"
                ).value;

            const email =
                document.getElementById(
                    "contactEmail"
                ).value;

            const message =
                document.getElementById(
                    "contactMessage"
                ).value;

            const status =
                document.getElementById(
                    "contactStatus"
                );

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

                            body: JSON.stringify({
                                name,
                                email,
                                message
                            })
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message
                    );
                }

                status.style.color =
                    "#6ff0a8";

                status.textContent =
                    "Message sent successfully!";

                contactForm.reset();

            } catch (error) {

                status.style.color =
                    "#ff8b8b";

                status.textContent =
                    error.message;

            }

        }
    );

}


/* =========================
   HTML ESCAPING
========================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
    } else {
        input.type = "password";
        button.textContent = "👁️";
    }
}
