# Paperboy

## Purpose

A node.js module for delivering static files.

## Example

Example from example/basic.js:
  var
    sys = require('sys'),
    path = require('path'),
    http = require('http'),
    paperboy = require('../lib/paperboy'),

    PORT = 8003,
    WEBROOT = path.join(path.dirname(__filename), 'webroot');

  http.createServer(function(req, res) {
    var ip = req.connection.remoteAddress;
    paperboy.deliver(WEBROOT, req, res,
    {
      expires: 900
    },
    {
      before: function() {
        sys.log('Recieved Request')
      },
      after: function(statCode) {
        res.write('Delivered: '+req.url);
        log(statCode, req.url, ip);
      },
      error: function(statCode,msg) {
        log(statCode, req.url, ip, msg)
      },
      otherwise: function() {
        var statCode = 404;
        res.writeHeader(statCode, {'Content-Type': 'text/plain'});
        res.write('Sorry, no paper this morning!');
        res.close();
        log(statCode, req.url, ip);
      }
    });
  }).listen(PORT);

  function log(statCode, url, ip,err) {
    var logStr = statCode + ' - ' + url + ' - ' + ip
    if (err)
      logStr += ' - ' + err;
    sys.log(logStr);
  }

## API Docs

### paperboy.deliver(webroot, req, res,opts,callbacks)

Checks the `webroot` folder if it has a file that matches the `req.url` and streams it to the client. If `req.url` ends with a '/' (slash), 'index.html' is appended automatically.

Parameters:

* `webroot`: Absolute path where too look for static files to serve
* `req`: A `http.ServerRequest` object
* `res`: A `http.ServerResponse` object
* `opts`: An object containing optional config parameters (only 'Expires' at the moment (in seconds))
* `callbacks`: An object containing all callbacks described below:

#### before()

Fires if a matching file was found in the `webroot` and is about to be delivered. The delivery can be canceled by returning `false` from within the callback.

#### after(statCode)

Fires after a file has been successfully delivered from the `webroot`. statCode contains the numeric HTTP status code that was sent to the client

#### error(statCode,msg)

Fires if there was an error delivering a file from the `webroot`. statCode contains the numeric HTTP status code that was sent to the clientmsg contains the error message.

#### otherwise()

Fires if no matching file was found in the `webroot`. Also fires if `false` was returned in the `delegate.before()` callback.

## License

Paperboy is licensed under the MIT license.

## Credits

* [Jan Lehnardt](http://twitter.com/janl) for coming up with the name "Paperboy"
