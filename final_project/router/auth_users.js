const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js"); // Import book data for review operations

const regd_users = express.Router();

// Array to store registered users. In a real application, this would be a database.
let users = [];

// ---
// Helper function: Checks if a username already exists in the users array.
// Returns true if username exists, false otherwise.
// ---
const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true; // Username already exists
  } else {
    return false; // Username is available
  }
};

// ---
// Helper function: Authenticates a user by checking username and password.
// Returns true if credentials match a registered user, false otherwise.
// ---
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true; // User found and credentials are correct
  } else {
    return false; // User not found or credentials incorrect
  }
};

// ---
// Task 7: Login as a registered user
// Route: POST /customer/login
// Handles user login, validates credentials, and issues a JWT if successful.
// ---
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Error logging in - Username and password required" });
  }

  if (authenticatedUser(username, password)) {
    // If authentication is successful, create a JWT
    // The payload 'data: username' stores the username in the token
    // 'access' is the secret key for signing/verifying the token
    // 'expiresIn' sets the token's validity period (e.g., 1 hour)
    let accessToken = jwt.sign(
      {
        data: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    ); // Token expires in 1 hour

    // Store the token and username in the session
    // This 'authorization' object will be checked by the authentication middleware in index.js
    req.session.authorization = {
      accessToken: accessToken,
      username: username,
    };
    return res
      .status(200)
      .json({ message: "User successfully logged in", token: accessToken });
  } else {
    // If authentication fails, send an error response
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// ---
// Task 8: Add or modify a book review
// Route: PUT /customer/auth/review/:isbn
// This route is protected by the authentication middleware in index.js.
// It allows an authenticated user to add a new review or modify an existing one for a given ISBN.
// ---
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get ISBN from URL parameters
  const review = req.query.review; // Get review content from query parameters
  const username = req.session.authorization.username; // Get username from session (set during login)

  if (!review) {
    return res.status(400).json({ message: "Review content cannot be empty." });
  }

  if (books[isbn]) {
    // Check if the book exists
    let reviews = books[isbn].reviews; // Get the reviews object for this book
    if (reviews[username]) {
      // If the user already has a review, modify it
      reviews[username] = review;
      return res
        .status(200)
        .json({
          message: `Review for ISBN ${isbn} by ${username} updated successfully.`,
        });
    } else {
      // If no existing review from this user, add a new one
      reviews[username] = review;
      return res
        .status(200)
        .json({
          message: `Review for ISBN ${isbn} by ${username} added successfully.`,
        });
    }
  } else {
    return res.status(404).json({ message: "Book not found." }); // Book not found
  }
});

// ---
// Task 9: Delete a book review
// Route: DELETE /customer/auth/review/:isbn
// This route is protected by the authentication middleware in index.js.
// It allows an authenticated user to delete their OWN review for a given ISBN.
// ---
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get ISBN from URL parameters
  const username = req.session.authorization.username; // Get username from session

  if (books[isbn]) {
    // Check if the book exists
    let reviews = books[isbn].reviews; // Get the reviews object for this book
    if (reviews[username]) {
      // If the user has a review, delete it
      delete reviews[username];
      return res
        .status(200)
        .json({
          message: `Review for ISBN ${isbn} by ${username} deleted successfully.`,
        });
    } else {
      return res
        .status(404)
        .json({ message: `No review found for ISBN ${isbn} by ${username}.` }); // User has no review for this book
    }
  } else {
    return res.status(404).json({ message: "Book not found." }); // Book not found
  }
});

// Export these modules so they can be used by other files (like index.js).
// 'authenticated' exports the router for protected routes.
// 'isValid' exports the helper function for username validation.
// 'users' exports the array storing registered users.
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
