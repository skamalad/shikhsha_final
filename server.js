const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
var methodOverride = require('method-override');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
// require("./config/passport")(passport)

const app = express();

// Logging
if (process.env.NODE_ENV === 'developement') {
  app.use(morgan('dev'));
}

// Handlebars
app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
      isEqual: function (a, b) {
        console.log(a, b);
        return a === b / 10;
      },
    },
  })
);
app.set('view engine', '.hbs');

// Session Middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
// app.use('/auth', require('./routes/auth').listUsers);

const PORT = process.env.PORT || 8080;

var server = app.listen(PORT);

process.on('uncaughtException', (err) => {
  console.error(err);
  server.close();
});

process.on('SIGTERM', () => {
  server.close();
});
