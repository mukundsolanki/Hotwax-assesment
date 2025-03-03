document.addEventListener('DOMContentLoaded', function () {
    const registerContainer = document.getElementById('registerContainer');
    const loginContainer = document.getElementById('loginContainer');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');

    showLogin.addEventListener('click', function () {
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    showRegister.addEventListener('click', function () {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // clearErrors();

        // Get form values
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        let isValid = true;

        if (!name) {
            document.getElementById('nameError').textContent = 'Name is required';
            isValid = false;
        }

        if (!email) {
            document.getElementById('emailError').textContent = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email';
            isValid = false;
        }

        if (!password) {
            document.getElementById('passwordError').textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Please confirm your password';
            isValid = false;
        } else if (confirmPassword !== password) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            isValid = false;
        }

        if (isValid) {
            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
            const existingUser = existingUsers.find(user => user.email === email);

            if (existingUser) {
                document.getElementById('emailError').textContent = 'Email already registered';
                return;
            }

            const userData = { name, email, password };
            existingUsers.push(userData);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            registerForm.reset();

            alert('Registration successful! Please login.');
            showLogin.click();
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // clearErrors();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        let isValid = true;

        if (!email) {
            document.getElementById('loginEmailError').textContent = 'Email is required';
            isValid = false;
        }

        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'Password is required';
            isValid = false;
        }

        if (isValid) {
            let name = "Open json";
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));

                alert('Login successful!');
                window.location.href = 'homepage.html';
            } else {
                document.getElementById('loginMessage').textContent = 'Invalid email or password';
            }
        }
    });

    function isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(element => {
            element.textContent = '';
        });
    }
});