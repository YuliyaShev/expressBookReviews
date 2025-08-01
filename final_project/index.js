const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated; // Authenticated routes
const genl_routes = require("./router/general.js").general; // General public routes

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies

// Session middleware for customer routes
// This creates a session for users accessing /customer routes
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// Authentication middleware for protected customer routes
// Any route under /customer/auth/* will pass through this middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if authorization object exists in session
  if (req.session.authorization) {
    // Retrieve the token from the authorization object
    let token = req.session.authorization["accessToken"];
    // Verify the JWT using the secret key "access"
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        // If token is valid, attach user information to the request
        req.user = user;
        next(); // Proceed to the next middleware or route handler
      } else {
        // If token is invalid, send a 403 Forbidden response
        return res
          .status(403)
          .json({ message: "User not authenticated - Invalid token" });
      }
    });
  } else {
    // If no authorization object in session, user is not logged in
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5001; // Your server will listen on port 5001

// Mount the authenticated customer routes under /customer
app.use("/customer", customer_routes);
// Mount the general public routes under the root path /
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log("Server is running on port " + PORT));
