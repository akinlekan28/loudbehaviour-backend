const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const winston = require("winston");
const expressWinston = require("express-winston");
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/db");

// Connect to database
connectDB();

//Load passport config
require("./utils/passport")(passport);

//Route files
const auth = require("./routes/auth");
const services = require("./routes/services");
const servicesCategory = require("./routes/servicesCategory");
const product = require("./routes/product");
const notification = require("./routes/notification");
const coupon = require("./routes/coupon");
const order = require("./routes/order");

const app = express();

// Body parser
app.use(express.json());

//wiston logger
app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })
);

// Cookie parser
app.use(cookieParser());

// File uploading
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Wiston request logger
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/services", services);
app.use("/api/v1/servicescategory", servicesCategory);
app.use("/api/v1/product", product);
app.use("/api/v1/notification", notification);
app.use("/api/v1/coupon", coupon);
app.use("/api/v1/order", order);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
});
