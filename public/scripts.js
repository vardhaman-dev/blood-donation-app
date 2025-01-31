// scripts.js (top of file)
const apiUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://617a5180-0f0f-46b9-8106-df14b7de8133@api.glitch.com/git/military-fork-mantis";

function showHome() {
  document.getElementById("content").innerHTML = `
        <h1 class="fade-in">Kyon na chhoden saare kaam aur karein raktdaan?</h1>
        <p class="fade-in">A Simple Act, a Lifesaving Impact</p>
    `;
}

function showDonationForm() {
  document.getElementById("content").innerHTML = `
        <div class="form-container fade-in">
            <h2>Donate Blood</h2>
            <form id="donationForm">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label>Blood Type</label>
                    <select id="bloodType" name="bloodType" required>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pincode">Pincode</label>
                    <input type="text" id="pincode" name="pincode" required>
                </div>
                <div class="form-group">
                    <label for="contact">Contact No</label>
                    <input type="tel" id="contact" name="contact" required>
                </div>
                <button type="submit" class="submit-btn">Submit</button>
            </form>
        </div>
    `;

  // Add event listener to handle form submission
  const form = document.getElementById("donationForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    try {
      // Send data to backend using Fetch API
      const response = await fetch(`${apiUrl}/donate-blood`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Error submitting the form");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
}

function showSearchForm() {
  document.getElementById("content").innerHTML = `
        <div class="form-container fade-in">
            <h2>Find Donor</h2>
            <form id="searchForm">
                <div class="form-group">
                    <label for="bloodGroup">Blood Group</label>
                    <select id="bloodGroup" name="bloodGroup" required>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="pincode">Pincode</label>
                    <input type="text" id="pincode" name="pincode" required>
                </div>
                <button type="submit" class="submit-btn">Search</button>
            </form>
            <div id="results" class="fade-in"></div> <!-- Section for results -->
        </div>
    `;

  // Add event listener for form submission
  const form = document.getElementById("searchForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    // Fix this line in showSearchForm()
    const formObject = Object.fromEntries(formData.entries()); // Remove the comma

    try {
      const response = await fetch(`${apiUrl}/search-donors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        const result = await response.json();
        displayResults(result.donors); // Call the function to display results
      } else {
        alert("Error fetching donors");
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
    }
  });
}

function displayResults(donors) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (donors.length === 0) {
    resultsDiv.innerHTML = "<p>No donors found.</p>";
    return;
  }

  const resultsList = donors
    .map(
      (donor) => `
        <div>
            <p>Name: <strong>${donor.name}</strong></p>
            <p>Pincode: <strong>${donor.pincode}</strong></p>
            <p>Phone: <strong>${donor.phone}</strong></p>
            <button class="submit-btn" onclick="deleteDonor('${donor.phone}')">Delete</button>
            <button class="submit-btn" onclick="showEditForm('${donor.name}', '${donor.bloodType}', '${donor.pincode}', '${donor.phone}')">Edit</button>
            <hr>
        </div>
    `,
    )
    .join("");

  resultsDiv.innerHTML = resultsList;
}

function showEditForm(name, bloodType, pincode, phone) {
  document.getElementById("content").innerHTML = `
        <div class="form-container fade-in">
            <h2>Edit Donor</h2>
            <form id="editForm">
                <div class="form-group">
                    <label for="editName">Name</label>
                    <input type="text" id="editName" name="name" value="${name}" required>
                </div>
                <div class="form-group">
                    <label for="editBloodType">Blood Type</label>
                    <select id="editBloodType" name="bloodType" required>
                        <option value="A+" ${bloodType === "A+" ? "selected" : ""}>A+</option>
                        <option value="A-" ${bloodType === "A-" ? "selected" : ""}>A-</option>
                        <option value="B+" ${bloodType === "B+" ? "selected" : ""}>B+</option>
                        <option value="B-" ${bloodType === "B-" ? "selected" : ""}>B-</option>
                        <option value="AB+" ${bloodType === "AB+" ? "selected" : ""}>AB+</option>
                        <option value="AB-" ${bloodType === "AB-" ? "selected" : ""}>AB-</option>
                        <option value="O+" ${bloodType === "O+" ? "selected" : ""}>O+</option>
                        <option value="O-" ${bloodType === "O-" ? "selected" : ""}>O-</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editPincode">Pincode</label>
                    <input type="text" id="editPincode" name="pincode" value="${pincode}" required>
                </div>
                <button type="button" class="submit-btn" onclick="updateDonor('${phone}')">Update</button>
                <button type="button" class="submit-btn" onclick="showSearchForm()">Cancel</button>
            </form>
        </div>
    `;
}

async function deleteDonor(phone) {
  if (!confirm("Are you sure you want to delete this donor?")) {
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/donors/${phone}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Donor deleted successfully");
      document.getElementById("searchForm").dispatchEvent(new Event("submit"));
    } else {
      alert("Error deleting donor");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting donor");
  }
}

async function updateDonor(phone) {
  const name = document.getElementById("editName").value;
  const bloodType = document.getElementById("editBloodType").value;
  const pincode = document.getElementById("editPincode").value;

  try {
    const response = await fetch(`${apiUrl}/donors/${phone}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, bloodType, pincode }),
    });

    if (response.ok) {
      alert("Donor updated successfully");
      showSearchForm(); // Return to search form
    } else {
      alert("Error updating donor");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error updating donor");
  }
}

function showSignupForm() {
  document.getElementById("content").innerHTML = `
        <div class="form-container fade-in">
            <h2>Sign Up</h2>
            <form id="signupForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="submit-btn">Sign Up</button>
            </form>
        </div>
    `;

  const form = document.getElementById("signupForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        alert("Signup successful! You can now log in.");
      } else {
        alert("Error during signup");
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  });
}

function showLoginForm() {
  document.getElementById("content").innerHTML = `
        <div class="form-container fade-in">
            <h2>Login</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="submit-btn">Login</button>
            </form>
        </div>
    `;

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const formObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Login successful!");
        localStorage.setItem("token", result.token);
      } else {
        alert("Error during login");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  });
}
