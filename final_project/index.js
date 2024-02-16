const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticated: customerRoutes } = require('./router/auth_users.js');
const { general: generalRoutes } = require('./router/general.js');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies from HTTP requests
app.use(express.json());

// Middleware for session handling
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Middleware for authentication
app.use("/customer/auth/*", (req, res, next) => {
    // Check if the user is authenticated
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify the JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware if the token is valid
            } else {
                // Send a 403 Forbidden response if the token is invalid
                return res.status(403).json({ message: "User not authenticated!" });
            }
        });
    } else {
        // Send a 403 Forbidden response if the user is not logged in
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Use the customer and general routes
app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
