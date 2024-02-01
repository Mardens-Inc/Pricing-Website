import Authentication from "/assets/lib/mardens-auth-lib.js";

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

const auth = new Authentication();
const adminLoginElement = $("#admin-login");


auth.loginWithTokenFromCookie().then((data) => {
    if (data.success) {
        adminLoginElement.html("Admin Actions");
    } else {
        adminLoginElement.html("Administrator Login");
    }
});

adminLoginElement.on("click", () => {
    if (auth.isLoggedIn) {
        displayAdminActions();
    } else {
        displayAdminLogin();
    }
});

$(auth).on("login", () => {
    // Change the button text to "Admin Actions"
    $("#admin-login").html("Admin Actions");
    // Hide the popup
    closePopup();
    // Load the admin actions script
    $("body").append(`
        <script class="admin-script" src="/assets/js/admin-actions.min.js"></script>
        <script class="admin-script" src="/assets/js/database-list.min.js"></script>
        <script class="admin-script" src="/assets/js/pricing-list.min.js"></script>
    `);
});

$(auth).on("logout", () => {
    window.location.reload();
})

// When the login form is submitted, check the username and password
$("#admin-login-popup.popup form").on("submit", async e => {
    startLoading();
    const target = $(e.target);

    // Clear the error message.
    target.find("#login-error").html("");

    // Get the entered data.
    const formData = new FormData(target[0]);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
        // Attempt to login.
        const response = await auth.login(username, password);
        if (!response.success) {
            if (response.message !== undefined) {
                target.find("#login-error").html(response.message);
            } else {
                target.find("#login-error").html("An unknown error occurred.");
            }
        }
        console.log(response);
    } catch (e) {
        if (e.responseJSON !== undefined && e.responseJSON.message !== undefined) {
            target.find("#login-error").html(e.responseJSON.message);
        } else {
            target.find("#login-error").html("An unknown error occurred.");
        }
    }
    stopLoading();
});

$(".logout").on("click", () => {
    startLoading();
    closePopup();
    auth.logout();
});
