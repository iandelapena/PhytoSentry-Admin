const loginForm = document.getElementById("loginForm");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const rememberMe = document.getElementById("rememberMe");

const forgotPassword = document.getElementById("forgotPassword");

const loginMessage = document.getElementById("loginMessage");


// =========================================
// SHOW / HIDE PASSWORD
// =========================================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        passwordInput.type = "password";

        togglePassword.setAttribute(
            "aria-label",
            "Show password"
        );

    }

});


// =========================================
// REMEMBER USERNAME
// =========================================

const savedUsername = localStorage.getItem(
    "phytosentryAdminUsername"
);

if (savedUsername) {

    usernameInput.value = savedUsername;

    rememberMe.checked = true;

}


// =========================================
// LOGIN FORM
// =========================================

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();


    // Clear previous message
    loginMessage.textContent = "";


    // Validate fields
    if (!username || !password) {

        showMessage(
            "Please enter your username and password.",
            "error"
        );

        return;

    }


    /*
        TEMPORARY DEMO LOGIN

        Username: admin
        Password: admin123

        This will later be replaced with
        Firebase Authentication.
    */

    const adminUsername = "admin";
    const adminPassword = "admin123";


    if (
        username === adminUsername &&
        password === adminPassword
    ) {

        // Save username if Remember Me is checked
        if (rememberMe.checked) {

            localStorage.setItem(
                "phytosentryAdminUsername",
                username
            );

        } else {

            localStorage.removeItem(
                "phytosentryAdminUsername"
            );

        }


        showMessage(
            "Login successful.",
            "success"
        );


        // Redirect to dashboard
        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 700);


    } else {

        showMessage(
            "Invalid username or password.",
            "error"
        );

    }

});


// =========================================
// FORGOT PASSWORD
// =========================================

forgotPassword.addEventListener("click", (event) => {

    event.preventDefault();

    showMessage(
        "Password reset will be available soon.",
        "error"
    );

});


// =========================================
// MESSAGE
// =========================================

function showMessage(message, type) {

    loginMessage.textContent = message;

    if (type === "success") {

        loginMessage.style.color = "#557609";

    } else {

        loginMessage.style.color = "#b42318";

    }

}