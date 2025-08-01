const express = require("express");
let books = require("./booksdb.js"); // This imports your book data
// Ensure isValid and users are exported from auth_users.js
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// ---
// Task 6: Register a new user
// This route handles POST requests for registering new users.
// It expects 'username' and 'password' in the request body.
// ---
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Use the isValid function to check if the username already exists
    if (!isValid(username)) {
      // If the username doesn't exist, add the new user to the users array
      users.push({ username: username, password: password });
      // Send a success response
      return res.status(200).json({
        message: "User successfully registered. You can now login.",
      });
    } else {
      // If the username already exists, send a conflict message
      return res.status(409).json({ message: "User already exists!" });
    }
  }
  // If username or password are not provided, send an error message
  return res.status(400).json({
    message: "Unable to register user. Username and password are required.",
  });
});

// ---
// Task 1: Get the list of all books available in the shop
// This route handles GET requests to the root URL.
// It returns the entire 'books' object, which contains all the book data.
// ---
public_users.get("/", function (req, res) {
  // Return the entire 'books' object as a JSON response.
  // Express's .json() method automatically stringifies the object
  // and sets the Content-Type header to application/json.
  return res.status(200).json(books);
});

// ---
// Task 10: Get the list of all books available in the shop (using Promises)
// This route demonstrates fetching all books asynchronously using a Promise.
// ---
public_users.get("/books", function (req, res) {
  // Create a new Promise that resolves with the 'books' object.
  // In a real application, this would involve a database call.
  const getBooksPromise = new Promise((resolve, reject) => {
    // Simulate an asynchronous operation (e.g., fetching from a DB)
    setTimeout(() => {
      resolve(books); // Resolve the promise with the books data
    }, 100); // Simulate a small delay
  });

  getBooksPromise.then(
    (bks) => {
      // When the promise resolves, send the books data as a JSON response
      return res.status(200).json(bks);
    },
    (error) => {
      // If the promise rejects (e.g., due to an error in DB fetch), send an error response
      return res
        .status(500)
        .json({ message: "Error fetching books asynchronously" });
    }
  );
});

// ---
// Task 2: Get book details based on ISBN
// This route handles GET requests with an ISBN parameter in the URL.
// It returns the details of the book corresponding to the provided ISBN.
// ---
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Extract ISBN from URL parameters
  if (books[isbn]) {
    // Check if a book with the given ISBN exists
    return res.status(200).json(books[isbn]); // Return book details
  } else {
    return res.status(404).json({ message: "Book not found" }); // Send error if book not found
  }
});

// ---
// Task 11: Get book details based on ISBN (using Promises)
// This route demonstrates fetching book details asynchronously using a Promise.
// ---
public_users.get("/async/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Extract ISBN from URL parameters

  const getBookByIsbnPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]); // Resolve with book details if found
      } else {
        reject({ message: "Book not found" }); // Reject if book not found
      }
    }, 100);
  });

  getBookByIsbnPromise.then(
    (book) => {
      return res.status(200).json(book);
    },
    (error) => {
      return res.status(404).json(error);
    }
  );
});

// ---
// Task 3: Get book details based on Author
// This route handles GET requests with an author parameter in the URL.
// It returns all books written by the specified author.
// ---
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author; // Extract author name from URL parameters
  let booksByAuthor = {}; // Object to store books by the author

  // Iterate through all books and check for matching authors
  for (let isbn in books) {
    if (books[isbn].author === author) {
      booksByAuthor[isbn] = books[isbn]; // Add book if author matches
    }
  }

  if (Object.keys(booksByAuthor).length > 0) {
    // Check if any books were found
    return res.status(200).json(booksByAuthor); // Return the found books
  } else {
    return res.status(404).json({ message: "No books found by this author" }); // Send error if no books found
  }
});

// ---
// Task 12: Get book details based on Author (using Async/Await)
// This route demonstrates fetching book details by author asynchronously using Async/Await.
// ---
public_users.get("/async/author/:author", async function (req, res) {
  const author = req.params.author; // Extract author name from URL parameters

  try {
    // Simulate an asynchronous operation
    const booksByAuthor = await new Promise((resolve, reject) => {
      setTimeout(() => {
        let foundBooks = {};
        for (let isbn in books) {
          if (books[isbn].author === author) {
            foundBooks[isbn] = books[isbn];
          }
        }
        if (Object.keys(foundBooks).length > 0) {
          resolve(foundBooks); // Resolve with found books
        } else {
          reject({ message: "No books found by this author" }); // Reject if no books found
        }
      }, 100);
    });
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json(error);
  }
});

// ---
// Task 4: Get all books based on Title
// This route handles GET requests with a title parameter in the URL.
// It returns all books with the specified title.
// ---
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title; // Extract title from URL parameters
  let booksByTitle = {}; // Object to store books by title

  // Iterate through all books and check for matching titles
  for (let isbn in books) {
    if (books[isbn].title === title) {
      booksByTitle[isbn] = books[isbn]; // Add book if title matches
    }
  }

  if (Object.keys(booksByTitle).length > 0) {
    // Check if any books were found
    return res.status(200).json(booksByTitle); // Return the found books
  } else {
    return res.status(404).json({ message: "No books found with this title" }); // Send error if no books found
  }
});

// ---
// Task 13: Get all books based on Title (using Async/Await)
// This route demonstrates fetching book details by title asynchronously using Async/Await.
// ---
public_users.get("/async/title/:title", async function (req, res) {
  const title = req.params.title; // Extract title from URL parameters

  try {
    // Simulate an asynchronous operation
    const booksByTitle = await new Promise((resolve, reject) => {
      setTimeout(() => {
        let foundBooks = {};
        for (let isbn in books) {
          if (books[isbn].title === title) {
            foundBooks[isbn] = books[isbn];
          }
        }
        if (Object.keys(foundBooks).length > 0) {
          resolve(foundBooks); // Resolve with found books
        } else {
          reject({ message: "No books found with this title" }); // Reject if no books found
        }
      }, 100);
    });
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json(error);
  }
});

// ---
// Task 5: Get book review
// This route handles GET requests with an ISBN parameter in the URL.
// It returns the reviews for the book with the specified ISBN.
// ---
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn; // Extract ISBN from URL parameters
  if (books[isbn]) {
    // Check if a book with the given ISBN exists
    return res.status(200).json(books[isbn].reviews); // Return book reviews
  } else {
    return res.status(404).json({ message: "Book not found" }); // Send error if book not found
  }
});

module.exports.general = public_users;
