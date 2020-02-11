const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const fs = require('fs');
const https = require('https');

const config = require('./config');
const applicantsRouter = require('./routes/applicants');
const adminsRouter = require('./routes/admins');
const SERVER_PORT = 8882;

mongoose.connect(config.DATABASE_ENDPOINT, {
    useNewUrlParser: true,
});
mongoose.set('useFindAndModify', false);

app.use(cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
}))
app.use(express.json()) // for parsing application/json
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
})) // for parsing application/x-www-form-urlencoded
app.use('/applicants', applicantsRouter);
app.use('/admins', adminsRouter);

/* https.createServer({
        key: fs.readFileSync(config.SSL_KEY, 'utf8'),
        cert: fs.readFileSync(config.SSL_CERT, 'utf8')
    }, app)
    .listen(SERVER_PORT); */
app.listen(SERVER_PORT);