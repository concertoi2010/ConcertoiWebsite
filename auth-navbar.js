/* =========================================
   CONCERTOI SHARED AUTH NAVBAR
========================================= */

const SUPABASE_URL =
    "https://rdgoryrmqyqmaigvfjay.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_UYh6EWbtsiTtVSD4KvqEqA_-IbVA-c6";


/* =========================================
   CREATE SUPABASE CLIENT
========================================= */

const concertoiSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================
   FIND LOGIN / ACCOUNT LINK
========================================= */

function getAuthLink() {

    /*
     * Every page should have:
     *
     * <a href="login.html" id="authLink">Login</a>
     *
     */

    return document.getElementById("authLink");

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

            console.error(
                "Concertoi auth error:",
                error
            );

            return;

        }


        /* =====================================
           USER IS LOGGED IN
        ===================================== */

        if (data.session) {

            const user =
                data.session.user;


            const metadata =
                user.user_metadata || {};


            const name =
                metadata.full_name ||
                metadata.name ||
                user.email?.split("@")[0] ||
                "Account";


            authLink.textContent =
                `👤 ${name}`;


            authLink.href =
                "account.html";


            authLink.classList.add(
                "logged-in"
            );


        }


        /* =====================================
           USER IS LOGGED OUT
        ===================================== */

        else {

            authLink.textContent =
                "Login";


            authLink.href =
                "login.html";


            authLink.classList.remove(
                "logged-in"
            );

        }


    } catch (error) {

        console.error(
            "Could not update navbar:",
            error
        );

    }

}


/* =========================================
   INITIAL CHECK
========================================= */

updateConcertoiNavbar();


/* =========================================
   WATCH FOR LOGIN / LOGOUT
========================================= */

concertoiSupabase.auth.onAuthStateChange(
    function () {

        updateConcertoiNavbar();

    }
);