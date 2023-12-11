/**
 * Displays the admin login popup and sets focus on the username input field.
 */
function displayAdminLogin() {
    openPopup("admin-login-popup");
    setTimeout(() => {
        $("#admin-login-popup.popup input#username").focus();
    }, 250);
}

/**
 * Displays the admin actions popup and disables body scrolling.
 */
function displayAdminActions() {
    openPopup("admin-actions-popup");
}

// Restrict access to these variables and functions
(async () => {
    // Check if the user is already logged in or not.
    // If the user is logged in, display the admin panel, otherwise display the login screen.
    const auth = new Authentication();
    $("#admin-login").html(auth.admin ? "Logout" : "Administrator Login");
    $("#admin-login").on("click", () => {
        if (auth.admin) {
            displayAdminActions();
        } else {
            displayAdminLogin();
        }
    });

    // When the user logs in, activate admin actions
    $(auth).on("logged-in", () => {
        // Change the button text to "Admin Actions"
        $("#admin-login").html("Admin Actions");
        // Hide the popup
        closePopup();
        // Load the admin actions script
        $("body").append(`
        <script id="admin-script" src="/assets/js/admin-actions.min.js"></script>
        <script id="admin-script" src="/assets/js/database-list.min.js"></script>
        <script id="admin-script" src="/assets/js/pricing-list.min.js"></script>
        `);
    });

    // When the login button is clicked, check the username and password
    $("#admin-login-popup.popup #login").on("click", () => {});

    // If the user clicks the login button, attempt to login with the credentials provided.
    $(".popup .login").on("click", handleLogin);

    // If the user presses the enter key, attempt to login with the credentials provided.
    $("#admin-login-popup.popup input").on("keypress", (e) => {
        if (e.key == "Enter") handleLogin();
    });

    /**
     * Attempts to login with the login popup credentials.
     */
    async function handleLogin() {
        // Set the timeout duration for the error messages
        let errorTimeoutDuration = 5000;

        // Get the username and password from the form
        let username = $("#admin-login-popup.popup input#username").val();
        let password = $("#admin-login-popup.popup input#password").val();

        // If the username is empty, show an error
        if (username == undefined || username == "") {
            $("#login-error").html("Please enter a username");
            $("#admin-login-popup.popup input#username").addClass("error");
            setTimeout(() => {
                $("#admin-login-popup.popup input#username").removeClass("error");
            }, errorTimeoutDuration);
            return;
        }

        // If the password is empty, show an error
        if (password == undefined || password == "") {
            $("#login-error").html("Please enter a password");
            $("#admin-login-popup.popup input#password").addClass("error");
            setTimeout(() => {
                $("#admin-login-popup.popup input#password").removeClass("error");
            }, errorTimeoutDuration);
            return;
        }

        // Try to login with the username and password
        let data = await auth.login(username, password);

        // If the login failed, show an error
        if (!data.success) {
            $("#login-error").html(data.error);
            $("#admin-login-popup.popup input#username").addClass("error");
            $("#admin-login-popup.popup input#password").addClass("error");
            setTimeout(() => {
                $("#admin-login-popup.popup input#username").removeClass("error");
                $("#admin-login-popup.popup input#password").removeClass("error");
            }, errorTimeoutDuration);
        }
    }
})();
