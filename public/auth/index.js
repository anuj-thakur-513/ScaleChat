document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  // Function to validate login form
  function validateLoginForm() {
    const loginUsername = document.getElementById("loginUsername").value;
    const loginPassword = document.getElementById("loginPassword").value;

    if (loginUsername.trim() === "" || loginPassword.trim() === "") {
      alert("Please fill in all the required fields.");
      return false;
    }

    return true;
  }

  // Function to validate signup form
  function validateSignupForm() {
    const signupUsername = document.getElementById("signupUsername").value;
    const signupPassword = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
      signupUsername.trim() === "" ||
      signupPassword.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      alert("Please fill in all the required fields.");
      return false;
    }

    if (signupPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    return true;
  }

  // Event listener for login form submission
  loginForm.addEventListener("submit", function (event) {
    if (!validateLoginForm()) {
      event.preventDefault();
    }
  });

  // Event listener for signup form submission
  signupForm.addEventListener("submit", function (event) {
    if (!validateSignupForm()) {
      event.preventDefault();
    }
  });
});
