/* =========================================
   CONCERTOI SHARED AUTH NAVBAR
========================================= */

const SUPABASE_URL =
    "https://rdgoryrmqyqmaigvfjay.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_UYh6EWbtsiTtVSD4KvqEqA_-IbVA-c6";

const AVATAR_BUCKET = "avatars";


/* =========================================
   SUPABASE CLIENT
========================================= */

const concertoiSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/*
 * Make the shared Supabase client available
 * to other scripts on the page.
 */

window.concertoiSupabase =
    concertoiSupabase;


/* =========================================
   FIND AUTH LINK
========================================= */

function getAuthLink() {

    return document.getElementById(
        "authLink"
    );

}


/* =========================================
   GET AVATAR
========================================= */

function getUserAvatar(user) {

    const metadata =
        user.user_metadata || {};

    return (
        metadata.avatar_url ||
        metadata.picture ||
        null
    );

}


/* =========================================
   GET CUSTOM AVATAR
========================================= */

function getCustomAvatarPath(user) {

    const metadata =
        user.user_metadata || {};

    return (
        metadata.avatar_path ||
        null
    );

}


/* =========================================
   GET PUBLIC AVATAR URL
========================================= */

function getAvatarUrl(path) {

    if (!path) {
        return null;
    }

    const {
        data
    } =
        concertoiSupabase.storage
            .from(AVATAR_BUCKET)
            .getPublicUrl(path);

    return (
        data?.publicUrl ||
        null
    );

}


/* =========================================
   CREATE AVATAR
========================================= */

function createAvatar(user) {

    const avatar =
        document.createElement("span");

    avatar.className =
        "auth-navbar-avatar";


    const customPath =
        getCustomAvatarPath(user);


    const googleAvatar =
        getUserAvatar(user);


    let imageUrl =
        null;


    if (customPath) {

        imageUrl =
            getAvatarUrl(
                customPath
            );

    }


    if (
        !imageUrl &&
        googleAvatar
    ) {

        imageUrl =
            googleAvatar;

    }


    if (imageUrl) {

        const image =
            document.createElement("img");

        image.src =
            imageUrl +
            (
                customPath
                    ? "?t=" + Date.now()
                    : ""
            );

        image.alt =
            "Profile avatar";


        image.onerror =
            function () {

                image.remove();

                avatar.textContent =
                    "👤";

            };


        avatar.appendChild(
            image
        );

    } else {

        avatar.textContent =
            "👤";

    }


    return avatar;

}


/* =========================================
   CLOSE DROPDOWN
========================================= */

function closeAuthDropdown() {

    const dropdown =
        document.getElementById(
            "authDropdown"
        );

    const authLink =
        getAuthLink();


    if (dropdown) {

        dropdown.classList.remove(
            "open"
        );

    }


    if (authLink) {

        authLink.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

async function logoutConcertoi() {

    try {

        const {
            error
        } =
            await concertoiSupabase.auth.signOut();


        if (error) {

            throw error;

        }


        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Concertoi logout error:",
            error
        );

    }

}


/* =========================================
   UPDATE NAVBAR
========================================= */

async function updateConcertoiNavbar() {

    const authLink =
        getAuthLink();


    /*
     * If the navbar HTML hasn't been created
     * yet, wait for DOMContentLoaded instead
     * of simply giving up.
     */

    if (!authLink) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await concertoiSupabase.auth.getSession();


        if (error) {

            throw error;

        }


        /* =====================================
           LOGGED OUT
        ===================================== */

        if (!data.session) {

            authLink.textContent =
                "Login";

            authLink.href =
                "login.html";

            authLink.classList.remove(
                "logged-in"
            );

            authLink.removeAttribute(
                "aria-expanded"
            );

            const oldDropdown =
                document.getElementById(
                    "authDropdown"
                );

            if (oldDropdown) {
                oldDropdown.remove();
            }

            return;

        }


        /* =====================================
           LOGGED IN
        ===================================== */

        const user =
            data.session.user;


        const metadata =
            user.user_metadata || {};


        const name =
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "Account";


        /* =====================================
           TURN LINK INTO ACCOUNT BUTTON
        ===================================== */

        authLink.href =
            "#";

        authLink.classList.add(
            "logged-in"
        );

        authLink.setAttribute(
            "aria-expanded",
            "false"
        );


        authLink.innerHTML =
            "";


        /* =====================================
           AVATAR
        ===================================== */

        const avatar =
            createAvatar(
                user
            );


        /* =====================================
           NAME
        ===================================== */

        const nameSpan =
            document.createElement("span");

        nameSpan.className =
            "auth-navbar-name";

        nameSpan.textContent =
            name;


        /* =====================================
           ARROW
        ===================================== */

        const arrow =
            document.createElement("span");

        arrow.className =
            "auth-navbar-arrow";

        arrow.textContent =
            "⌄";


        authLink.appendChild(
            avatar
        );

        authLink.appendChild(
            nameSpan
        );

        authLink.appendChild(
            arrow
        );


        /* =====================================
           CREATE DROPDOWN
        ===================================== */

        let dropdown =
            document.getElementById(
                "authDropdown"
            );


        if (dropdown) {

            dropdown.remove();

        }


        dropdown =
            document.createElement("div");

        dropdown.id =
            "authDropdown";

        dropdown.className =
            "auth-dropdown";


        /* =====================================
           ACCOUNT LINK
        ===================================== */

        const accountLink =
            document.createElement("a");

        accountLink.href =
            "account.html";

        accountLink.className =
            "auth-dropdown-item";

        accountLink.innerHTML =
            `
                <span>👤</span>
                <span>Account</span>
            `;


        /* =====================================
           LOGOUT BUTTON
        ===================================== */

        const logoutButton =
            document.createElement("button");

        logoutButton.type =
            "button";

        logoutButton.className =
            "auth-dropdown-item logout";

        logoutButton.innerHTML =
            `
                <span>🚪</span>
                <span>Log Out</span>
            `;


        logoutButton.addEventListener(
            "click",
            logoutConcertoi
        );


        dropdown.appendChild(
            accountLink
        );

        dropdown.appendChild(
            logoutButton
        );


        if (authLink.parentElement) {

            authLink.parentElement.appendChild(
                dropdown
            );

        }


        /* =====================================
           ACCOUNT BUTTON CLICK
        ===================================== */

        authLink.onclick =
            function (event) {

                event.preventDefault();


                const isOpen =
                    dropdown.classList.contains(
                        "open"
                    );


                closeAuthDropdown();


                if (!isOpen) {

                    dropdown.classList.add(
                        "open"
                    );

                    authLink.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            };


    } catch (error) {

        console.error(
            "Could not update navbar:",
            error
        );

    }

}


/* =========================================
   CLOSE WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener(
    "click",
    function (event) {

        const authLink =
            getAuthLink();

        const dropdown =
            document.getElementById(
                "authDropdown"
            );


        if (
            dropdown &&
            authLink &&
            !authLink.contains(
                event.target
            ) &&
            !dropdown.contains(
                event.target
            )
        ) {

            closeAuthDropdown();

        }

    }
);


/* =========================================
   INITIALISE AFTER HTML EXISTS
========================================= */

function initialiseConcertoiNavbar() {

    updateConcertoiNavbar();

}


/*
 * This is the important part.
 *
 * auth-navbar.js is loaded inside <head>
 * on sheetmusic.html, so the navbar doesn't
 * exist yet.
 *
 * Wait until the DOM is ready before checking
 * the session.
 */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseConcertoiNavbar,
        {
            once: true
        }
    );

} else {

    initialiseConcertoiNavbar();

}


/* =========================================
   WATCH LOGIN / LOGOUT
========================================= */

concertoiSupabase.auth.onAuthStateChange(
    function () {

        /*
         * Wait until the current auth event
         * has completed before updating the UI.
         */

        setTimeout(
            updateConcertoiNavbar,
            0
        );

    }
);

