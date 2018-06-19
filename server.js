var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();
clear();
console.log(chalk.yellow(figlet.textSync('Cors Proxy', {
    horizontalLayout: 'center'
})));

var myLimit = typeof (process.argv[2]) != 'undefined' ? process.argv[2] : '200kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({
    limit: myLimit
}));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
    // res.header("Authorization", req.header('Authorization'));
    // res.header();

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.send(500, {
                error: 'There is no Target-URL header in the request'
            });
            return;
        }
        // 'Authorization': req.header('Authorization'),
        request({
                url: targetURL + req.url,
                method: req.method,
                json: req.body,
                headers: {
                    'X-DocuSign-Authentication': req.header('X-DocuSign-Authentication')
                }
            },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                } else {
                    console.log(new Date(), targetURL + req.url, JSON.stringify(body).length);
                }
                // console.log(body);
            }).pipe(res);
    }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Server started', new Date());
    console.log('Proxy server listening on port ' + app.get('port'));
});