const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/build'))

/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
})

//app.listen(PORT);

https.createServer({
    key: fs.readFileSync('nebula_tamudatathon_com.pem'),
    cert: fs.readFileSync('nebula_tamudatathon_com.crt')
}, app)
    .listen(PORT);