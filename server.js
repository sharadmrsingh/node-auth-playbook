const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const setupSwagger = require("./swagger");

dotenv.config();

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true if https
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => res.send('Node Auth Playbook'));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongo connected');
        app.listen(PORT, () => console.log('Server running on', PORT));
    })
    .catch(err => console.error(err));
setupSwagger(app);