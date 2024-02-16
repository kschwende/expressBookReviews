// Importing required modules
const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");

// Creating a router for public users
const public_users = express.Router();

// Route for registering a new user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  // Creating a new Promise
  return new Promise((resolve, reject) => {
    // If username and password are provided and username is valid
    if(username && password && !isValid(username)){
      // Add the new user to the users array
      users.push({ username, password });
      // Resolve the Promise with a success message
      resolve({ message: "User Added Successfully!!!Now you can log in" });
    } else {
      // Reject the Promise with an error message
      reject({ message: "Unable to register User!!!" });
    }
  })
  // Send the result of the Promise as a response
  .then(result => res.status(200).json(result))
  // Handle any errors that occurred while processing the Promise
  .catch(error => res.status(404).json(error));
});

// Function to find books based on the provided query
function findBooks(query) {
  return new Promise((resolve, reject) => {
    const { isbn, author, title, reviews } = query;

    // If an ISBN is provided
    if (isbn) {
      const book = books[isbn];
      // If the book is not found, reject the Promise with an error message
      if (!book) reject({ message: "Book not found" });
      // If reviews are requested, resolve the Promise with the book's reviews, otherwise resolve with the book
      resolve(reviews ? book.reviews : book);
    }

    // If an author is provided
    if (author) {
      const booksByAuthor = Object.values(books).filter(book => book.author === author);
      // If no books are found, reject the Promise with an error message
      if (!booksByAuthor.length) reject({ message: "Books not found" });
      // Resolve the Promise with the books by the provided author
      resolve(booksByAuthor);
    }

    // If a title is provided
    if (title) {
      const booksByTitle = Object.values(books).filter(book => book.title === title);
      // If no books are found, reject the Promise with an error message
      if (!booksByTitle.length) reject({ message: "Books not found" });
      // Resolve the Promise with the books with the provided title
      resolve(booksByTitle);
    }

    // If no specific query is provided, resolve the Promise with all books
    resolve({ books });
  });
}

// Route for getting books based on a query
public_users.get('/', (req, res) => {
  // Use the findBooks function to get the books based on the query
  findBooks(req.query)
    // Send the result of the Promise as a response
    .then(result => res.json(result))
    // Handle any errors that occurred while processing the Promise
    .catch(error => res.status(404).json(error));
});

// Export the router
module.exports.general = public_users;
