// NODEJS CORE MODULES
const path = require("path");
const fs = require("fs");

// THIRD PARTY MODULES
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const errorController = require("./controllers/errorController");
const User = require("./models/userModel");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@nodejs-complete-guide-mx3j8.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: "sessions" });
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

// MY IMPORTS - ROUTES FILES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const isAuth = require("./middleware/is-auth");
const shopController = require("./controllers/shopController");

// setting/declaring storage engine for multer and then using it below
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
// SERVING PULBIC & PUBLIC FOLDER STATICALLY
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
// SESSION MIDDLEWARE
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash());

// Passing on variables/values to all the rendered views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

// MIDDLEWARE
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

// ROUTES
app.post("/create-order", isAuth, shopController.postOrder);
// This ignore csrfprotetcion for the above route
app.use(csrfProtection);
// Passing on variables/values to all the rendered views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);

// express error handling middleware
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(..);
  // res.redirect("/500");
  res.status(500).render("500", {
    path: "/500",
    pageTitle: "Something went wrong"
  });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(result => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started at 3000");
    });
  })
  .catch(err => {
    console.log(err);
  });
