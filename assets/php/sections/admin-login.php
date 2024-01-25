<div id="admin-login-popup" class="popup">
    <div class="popup-content">
        <div class="popup-header row center vertical">
            <div class="title fill">Admin Login</div>
            <button class="close">x</button>
        </div>
        <form action="javascript:void(0);" class="popup-body">

            <div class="form-input col center horizontal">
                <label for="username">Username</label>
                <input type="text" name="username" id="username" placeholder="Username" autocomplete="username" required>
            </div>
            <div class="form-input col center horizontal">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" placeholder="Password" autocomplete="current-password" required>
            </div>
            <p id="login-error" class="error center horizontal"></p>
            <div class="row center horizontal">
                <button class="login">Login</button>
            </div>
        </form>
    </div>
</div>
