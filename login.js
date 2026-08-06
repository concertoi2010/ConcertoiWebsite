/* =========================================
   CONCERTOI SUPABASE AUTHENTICATION
========================================= */

const SUPABASE_URL =
    "https://rdgoryrmqyqmaigvfjay.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_UYh6EWbtsiTtVSD4KvqEqA_-IbVA-c6";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================
   ELEMENTS
========================================= */

const container =
    document.getElementById("container");

const loginPanelButton =
    document.getElementById("login");

const registerPanelButton =
    document.getElementById("register");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const signupConfirmPassword =
    document.getElementById("signupConfirmPassword");

const loginButton =
    document.getElementById("loginButton");

const signupButton =
    document.getElementById("signupButton");

const loginMessage =
    document.getElementById("loginMessage");

const signupMessage =
    document.getElementById("signupMessage");

const forgotPassword =
    document.getElementById("forgotPassword");

const googleLogin =
    document.getElementById("googleLogin");

const googleSignup =
    document.getElementById("googleSignup");


/* =========================================
   SLIDING LOGIN / SIGNUP PANEL
========================================= */

if (registerPanelButton) {

    registerPanelButton.addEventListener(
        "click",
        () => {

            container.classList.add("active");

        }
    );

}


if (loginPanelButton) {

    loginPanelButton.addEventListener(
        "click",
        () => {

            container.classList.remove("active");

        }
    );

}


/* =========================================
   MESSAGE HELPERS
========================================= */

function showLoginMessage(message, type = "error") {

    loginMessage.textContent = message;

    loginMessage.className =
        `auth-message ${type}`;

}


function showSignupMessage(message, type = "error") {

    signupMessage.textContent = message;

    signupMessage.className =
        `auth-message ${type}`;

}


function clearMessages() {

    loginMessage.textContent = "";
    signupMessage.textContent = "";

}


/* =========================================
   SIGN UP
========================================= */

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessages();

        const name =
            signupName.value.trim();

        const email =
            signupEmail.value.trim();

        const password =
            signupPassword.value;

        const confirmPassword =
            signupConfirmPassword.value;


        /* Check passwords */

        if (password !== confirmPassword) {

            showSignupMessage(
                "Passwords do not match."
            );

            return;

        }


        /* Check password length */

        if (password.length < 6) {

            showSignupMessage(
                "Password must be at least 6 characters."
            );

            return;

        }


        signupButton.disabled = true;

        signupButton.textContent =
            "Creating account...";


        try {

            const {
                data,
                error
            } = await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        full_name: name

                    }

                }

            });


            if (error) {

                throw error;

            }


            /*
             * If email confirmation is enabled,
             * Supabase will require the user
             * to confirm their email.
             */

            if (
                data.user &&
                !data.session
            ) {

                showSignupMessage(
                    "Account created! Check your email to confirm your account.",
                    "success"
                );

            } else {

                showSignupMessage(
                    "Account created! Redirecting...",
                    "success"
                );

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1000);

            }


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            showSignupMessage(
                error.message ||
                "Could not create your account."
            );

        }


        signupButton.disabled = false;

        signupButton.textContent =
            "Create Account";

    }
);


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessages();

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";


        try {

            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


            if (error) {

                throw error;

            }


            showLoginMessage(
                "Login successful! Redirecting...",
                "success"
            );


            setTimeout(() => {

                const params =
                    new URLSearchParams(
                        window.location.search
                    );

                const returnTo =
                    params.get("returnTo");

                if (returnTo) {

                    window.location.href =
                        returnTo;

                } else {

                    window.location.href =
                        "index.html";

                }

            }, 700);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showLoginMessage(
                error.message ||
                "Incorrect email or password."
            );

        }


        loginButton.disabled = false;

        loginButton.textContent =
            "Sign In";

    }
);


/* =========================================
   FORGOT PASSWORD
========================================= */

forgotPassword.addEventListener(
    "click",
    async function (event) {

        event.preventDefault();

        clearMessages();

        const email =
            loginEmail.value.trim();


        if (!email) {

            showLoginMessage(
                "Enter your email address first."
            );

            loginEmail.focus();

            return;

        }


        try {

            const {
                error
            } = await supabaseClient.auth.resetPasswordForEmail(
                email,
                {

                    redirectTo:
                        `${window.location.origin}/reset-password.html`

                }
            );


            if (error) {

                throw error;

            }


            showLoginMessage(
                "Password reset email sent! Check your inbox.",
                "success"
            );


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            showLoginMessage(
                error.message ||
                "Could not send the password reset email."
            );

        }

    }
);


/* =========================================
   GOOGLE LOGIN
========================================= */

async function signInWithGoogle() {

    try {

        const {
            error
        } = await supabaseClient.auth.signInWithOAuth({

            provider: "google",

            options: {

                redirectTo:
                    window.location.origin + "/index.html"

            }

        });


        if (error) {

            throw error;

        }


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );


        showLoginMessage(
            "Google login is not configured yet."
        );

    }

}


googleLogin.addEventListener(
    "click",
    signInWithGoogle
);


googleSignup.addEventListener(
    "click",
    signInWithGoogle
);


/* =========================================
   CHECK CURRENT SESSION
========================================= */

async function checkSession() {

    const {
        data
    } = await supabaseClient.auth.getSession();


    if (data.session) {

        console.log(
            "Already logged in:",
            data.session.user.email
        );

    }

}


checkSession();