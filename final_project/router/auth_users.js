const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if a username is valid (exists in the users array)
const isValid = (username) => users.some(user => user.username === username);

// Function to authenticate a user by checking if the username and password match an existing user
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);

// Route to login a user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are valid
  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(404).json({ message: "Invalid username or password!!!" });
  }

  // Generate a JWT token for the user
  let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: '1h' });

  // Store the token and username in the session
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "User logged in" +  accessToken});
});

// Route to add a review to a book
regd_users.put("/auth/review", (req, res) => {
  const { username, password, reviews } = req.body;
  const { isbn } = req.query;

  // Check if the username and password are valid
  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(404).json({ message: "Invalid username or password!!!" });
  }

  // Check if the book exists and add the review
  let book = books[isbn];
  if (book && reviews) {
    book["reviews"] = reviews;
    books[isbn] = book;
    return res.send(`Books with isbn ${isbn} updated its review`);
  }

  return res.status(404).json({ message: `Books with the isbn ${isbn} Not found!!!` });
});

// Route to delete a review from a book
regd_users.delete("/auth/review", (req, res) => {
  const { username, password } = req.body;
  const { isbn } = req.query;

  // Check if the username and password are valid
  if (!username || !password || !authenticatedUser(username, password)) {
    return res.status(404).json({ message: "Invalid username or password!!!" });
  }

  // Check if the book exists and delete the review
  if (books[isbn]) {
    delete books[isbn]["reviews"];
    return res.send(`Reviews of the book with isbn ${isbn} has been deleted.`);
  }

  return res.status(404).json({ message: `Books with the isbn ${isbn} Not found!!!` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
