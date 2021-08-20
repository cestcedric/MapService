let express = require('express');
let bodyParser = require('body-parser');
let app = express();

let PORT = process.env.REST_PORT || 8080;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
app.listen(PORT, function () {
    console.log('listening on port ' + PORT);
});

module.exports = app;