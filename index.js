const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const path = require("path");
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoose = require("mongoose");
require("dotenv").config();
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const homeRoutes = require("./routes/home");
const cartRoutes = require("./routes/cart");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const varMiddleware = require("./middlewares/variables");
const userMiddleware = require("./middlewares/user");
const errorPage = require("./middlewares/errorPage");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST;
const SESSION_SECRET = process.env.SESSION_SECRET;

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  helpers: require("./utils/hbs-helpers"),
});
const store = new MongoStore({
  collection: "sessions",
  uri: DB_HOST,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

app.use(errorPage);

async function start() {
  try {
    await mongoose.connect(DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
