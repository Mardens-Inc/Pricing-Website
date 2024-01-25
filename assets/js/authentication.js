import {Authentication as auth} from "/assets/lib/mardens-auth-lib";

/**
 * Handles the authentication of the user.
 * @class Authentication
 * @property {boolean} admin - Indicates whether the user is an admin or not.
 * @property {number} inactivityTimer - The timer that will log the user out after 5 minutes of inactivity.
 * @method loginWithToken - Logs the user in with the token stored in the cookies.
 * @method login - Logs the user in with the provided username and password.
 * @method logout - Logs the user out by clearing the authentication token and reloading the page.
 * @method isLoggedIn - Checks if the user is logged in.
 * @method resetInactivityTimer - Resets the inactivity timer.
 * @method handleAuthData - Handles the authorization data.
 * @file This file defines the Authentication class.
 * @requires jQuery
 */
class Authentication {
    constructor() {
        this.auth = new auth();
        this.admin = false;
        this.inactivityTimer;
        this.resetInactivityTimer();
        this.admin = this.isLoggedIn();

        $("body").on("mousemove", () => this.resetInactivityTimer());
        $("body").on("keypress", () => this.resetInactivityTimer());
        $("body").on("click", () => this.resetInactivityTimer());
        $("body").on("touchstart", () => this.resetInactivityTimer());
        $("body").on("touchmove", () => this.resetInactivityTimer());
        $("body").on("touchend", () => this.resetInactivityTimer());
        $(".logout").on("click", () => this.logout());
    }

    /**
     * Logs the user in with the token stored in the cookies
     * @returns {object} The data returned from the server
     */
    async loginWithToken() {
        return await this.auth.loginWithTokenFromCookie();
    }

    /**
     * Logs the user in with the provided username and password
     * @param {string} username
     * @param {string} password
     * @returns {object} The data returned from the server
     */
    async login(username, password) {
        $("#login-error").html("");

        const data = await this.auth.login(username, password);
        if (!this.handleAuthData(data)) {
            console.error(`Error logging in: ${data.error}`);
        }
    }

    /**
     * Logs out the user by clearing the authentication token and reloading the page.
     */
    logout() {
        this.auth.logout();
        window.location.reload();
    }

    /**
     * Checks if the user is logged in
     * @returns {boolean} Whether or not the user is logged in
     */
    async isLoggedIn() {
        let data = await this.loginWithToken();
        return data.error === undefined;
    }

    /**
     * Resets the inactivity timer.
     * If the timer is already set, it will be cleared before setting a new timer.
     * If the user is not an admin, the timer will not be set.
     * When the timer expires, it will call the logout function, remove the active class from any popup element, and display the admin login.
     */
    resetInactivityTimer() {
        if (this.inactivityTimer !== undefined) clearTimeout(this.inactivityTimer);

        if (!this.admin) return;

        this.inactivityTimer = setTimeout(() => {
            this.logout();
            closePopup();
            displayAdminLogin();
        }, 1000 * 60 * 5);
    }

    /**
     * Handles the authorization data.
     * @param {Object} data - The authorization data.
     * @returns {boolean} - Indicates whether the authorization was successful.
     */
    handleAuthData(data) {
        if (data.error === undefined) {
            this.admin = true;
            this.resetInactivityTimer();
            $(this).trigger("logged-in");
        }
        return data.success;
    }
}
