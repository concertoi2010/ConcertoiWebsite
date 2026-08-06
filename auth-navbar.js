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
 *
 * This allows sheetmusic.html to use:
 *
 * window.concertoiSupabase.auth.getSession()
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

    const authButton =
        document.getElementById(
            "authButton"
        );


    if (dropdown) {

        dropdown.classList.remove(
            "open"
        );

    }


    if (authButton) {

        authButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* =========================================
   CREATE LOGOUT
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
           TURN LINK INTO BUTTON
        ===================================== */

        authLink.href =
            "#";

        authLink.classList.add(
            "logged-in"
        );


        authLink.innerHTML =
            "";


        const avatar =
            createAvatar(
                user
            );


        const nameSpan =
            document.createElement("span");

        nameSpan.className =
            "auth-navbar-name";

        nameSpan.textContent =
            name;


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


        /* ACCOUNT */

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


        /* LOGOUT */

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


        authLink.parentElement.appendChild(
            dropdown
        );


        /* =====================================
           BUTTON CLICK
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
            document.getElementById(
                "authLink"
            );

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
   INITIAL CHECK
========================================= */

updateConcertoiNavbar();


/* =========================================
   WATCH LOGIN / LOGOUT
========================================= */

concertoiSupabase.auth.onAuthStateChange(
    function () {

        setTimeout(
            updateConcertoiNavbar,
            0
        );

    }
);

