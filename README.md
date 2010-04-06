# Paperboy

## Purpose

A node.js module for delivering static files.

## Features
  
 * Configurable callbacks on most events
 * ETag / 304 Support
 * Custom HTTP headers

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
      paperboy
        .deliver(WEBROOT, req, res)
        .addHeader('Expires', 300)
        .addHeader('X-PaperRoute', 'Node')
        .before(function() {
          sys.log('Recieved Request')
        })
        .after(function(statCode) {
          res.write('Delivered: '+req.url);
          log(statCode, req.url, ip);
        })
        .error(function(statCode,msg) {
          res.writeHead(statCode, {'Content-Type': 'text/plain'});
          res.write("Error: " + statCode);
          res.close();
          log(statCode, req.url, ip, msg);
        })
        .otherwise(function(err) {
          var statCode = 404;
          res.writeHead(statCode, {'Content-Type': 'text/plain'});
          log(statCode, req.url, ip, err);
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

Fires if there was an error delivering a file from the `webroot`. statCode contains the numeric HTTP status code that was sent to the clientmsg contains the error message. You must close the connection yourself if the error callback fires!

#### otherwise(err)

Fires if no matching file was found in the `webroot`. Also fires if `false` was returned in the `delegate.before()` callback. If there was a problem stating the file, `err` is set to the contents of that error message.

#### addHeader(name,value)

Sets an arbitrary HTTP header. The header name `Expires` is special and expects the number of seconds till expiry, from which it will calculate the proper HTTP date.

## License

Paperboy is licensed under the MIT license.

## Credits

* [Jan Lehnardt](http://twitter.com/janl) for coming up with the name "Paperboy"
