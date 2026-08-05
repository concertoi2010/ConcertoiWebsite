export async function onRequestPost(context) {

    try {

        const { request, env } = context;

        if (request.method !== "POST") {

            return Response.json(
                {
                    error: "Method not allowed."
                },
                {
                    status: 405
                }
            );

        }

        const data = await request.json();

        const message =
            typeof data?.message === "string"
                ? data.message.trim()
                : "";

        if (!message) {

            return Response.json(
                {
                    error: "Please enter a message."
                },
                {
                    status: 400
                }
            );

        }


        /* =========================================
           CHECK CLOUDFLARE AI SEARCH CONFIGURATION
        ========================================= */

        if (
            !env.CLOUDFLARE_API_TOKEN ||
            !env.CLOUDFLARE_ACCOUNT_ID
        ) {

            console.error(
                "Cloudflare AI Search environment variables are missing."
            );

            return Response.json(
                {
                    error:
                        "Concertoi AI is not configured correctly."
                },
                {
                    status: 500
                }
            );

        }


        /* =========================================
           CONCERTOI AI SEARCH
        ========================================= */

        const aiSearchURL =
            `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/concertoi/chat/completions`;


        const aiResponse = await fetch(
            aiSearchURL,
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${env.CLOUDFLARE_API_TOKEN}`,

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    messages: [

                        {
                            role: "system",

                            content: `

You are Concertoi AI.

You are the friendly AI assistant for the Concertoi website.

Use the information retrieved from the Concertoi website to answer questions accurately.

IMPORTANT ACCURACY RULES:

Never make up information about Concertoi.

Only claim that a Concertoi feature, page, song, or piece of sheet music exists when the website information supports it.

If the website does not contain information about something, clearly say that you don't currently have information about it.

Do not invent sheet music.

Do not invent website features.

Do not claim Concertoi has a sheet music request system unless the website actually says that it does.

If someone asks about something that is not currently shown on the website, say that you don't currently have information showing that Concertoi offers it.

NORMAL CONVERSATION:

If someone says "hi", say hello.

If someone asks "what is Concertoi?", explain Concertoi using the website information.

If someone asks a general music question, answer normally when possible.

If someone asks about Concertoi, prioritize information from the Concertoi website.

Do not redirect someone just because they mention sheet music.

Do not redirect someone just because they mention a song.

Do not redirect someone just because they ask whether Concertoi has something.

NAVIGATION:

Only navigate when the user CLEARLY asks to go to a page.

Examples:

"Take me to the Sheet Music page"
=> navigate to sheetmusic

"Open the Contact page"
=> navigate to contact

"Show me the About page"
=> navigate to about

"Go home"
=> navigate to home

Otherwise:
=> do not navigate.

Keep responses short and natural.
Usually 1-3 sentences.

IMPORTANT RESPONSE FORMAT:

You do NOT need to return JSON.

Just return the normal answer to the user's question.

Do not include labels such as:
"response:"
"navigate:"
"answer:"

Just answer naturally.

`

                        },

                        {
                            role: "user",

                            content: message

                        }

                    ]

                })

            }

        );


        /* =========================================
           CHECK AI SEARCH RESPONSE
        ========================================= */

        if (!aiResponse.ok) {

            const errorText =
                await aiResponse.text();

            console.error(
                "Cloudflare AI Search error:",
                aiResponse.status,
                errorText
            );

            return Response.json(
                {
                    error:
                        "Concertoi AI couldn't search the website right now."
                },
                {
                    status: 500
                }
            );

        }


        const result =
            await aiResponse.json();


        /* =========================================
           GET AI TEXT
        ========================================= */

        let responseText = "";


        if (
            result &&
            Array.isArray(result.choices) &&
            result.choices.length > 0
        ) {

            const choice =
                result.choices[0];

            if (
                choice.message &&
                typeof choice.message.content === "string"
            ) {

                responseText =
                    choice.message.content;

            }

            else if (
                typeof choice.text === "string"
            ) {

                responseText =
                    choice.text;

            }

        }


        /* Fallbacks for possible Cloudflare formats */

        if (!responseText && result?.response) {

            if (
                typeof result.response === "string"
            ) {

                responseText =
                    result.response;

            }

            else if (
                typeof result.response.response === "string"
            ) {

                responseText =
                    result.response.response;

            }

        }


        if (!responseText) {

            console.error(
                "Unexpected Cloudflare AI Search response:",
                result
            );

            return Response.json(
                {
                    error:
                        "Concertoi AI returned an invalid response."
                },
                {
                    status: 500
                }
            );

        }


        responseText =
            responseText
                .trim();


        /* =========================================
           NAVIGATION DETECTION
        ========================================= */

        const text =
            message.toLowerCase();


        let navigate = null;


        /*
         * ONLY navigate when the user explicitly
         * asks to go somewhere.
         */


        if (
            (
                text.includes("take me to") ||
                text.includes("go to") ||
                text.includes("open") ||
                text.includes("show me") ||
                text.includes("bring me to")
            )
            &&
            text.includes("sheet music")
        ) {

            navigate = "sheetmusic";

        }

        else if (
            (
                text.includes("take me to") ||
                text.includes("go to") ||
                text.includes("open") ||
                text.includes("show me") ||
                text.includes("bring me to")
            )
            &&
            text.includes("contact")
        ) {

            navigate = "contact";

        }

        else if (
            (
                text.includes("take me to") ||
                text.includes("go to") ||
                text.includes("open") ||
                text.includes("show me") ||
                text.includes("bring me to")
            )
            &&
            text.includes("about")
        ) {

            navigate = "about";

        }

        else if (
            (
                text.includes("take me to") ||
                text.includes("go to") ||
                text.includes("open") ||
                text.includes("show me") ||
                text.includes("bring me to")
            )
            &&
            (
                text.includes("home") ||
                text.includes("homepage")
            )
        ) {

            navigate = "home";

        }


        /* =========================================
           RETURN RESPONSE
        ========================================= */

        return Response.json({

            response:
                responseText,

            navigate:
                navigate

        });


    }

    catch (error) {

        console.error(
            "Concertoi AI error:",
            error
        );

        return Response.json(
            {
                error:
                    "Sorry, Concertoi AI couldn't respond right now."
            },
            {
                status: 500
            }
        );

    }

}