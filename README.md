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
      paperboy
        .deliver(WEBROOT, req, res)
        .before(function() {
          sys.puts('About to deliver: '+req.url);
        })
        .after(function() {
          sys.puts('Delivered: '+req.url);
        })
        .error(function() {
          sys.puts('Error delivering: '+req.url);
        })
        .otherwise(function() {
          res.sendHeader(404, {'Content-Type': 'text/plain'});
          res.sendBody('Sorry, no paper this morning!');
          res.finish();
        });
    }).listen(PORT);

## API Docs

### paperboy.deliver(webroot, req, res)

Checks the `webroot` folder if it has a file that matches the `req.url` and streams it to the client. If `req.url` ends with a '/' (slash), 'index.html' is appended automatically.

Parameters:

* `webroot`: Absolute path where too look for static files to serve
* `req`: A `http.ServerRequest` object
* `res`: A `http.ServerResponse` object

The function returns a delegate object that provides the methods below. Each of those methods returns the delegate itself, allowing for chaining.

#### delegate.before(callback)

Fires if a matching file was found in the `webroot` and is about to be delivered. The delivery can be canceled by returning `false` from within the callback.

#### delegate.after(callback)

Fires after a file has been successfully delivered from the `webroot`.

#### delegate.error(callback)

Fires if there was an error delivering a file from the `webroot`.

#### delegate.otherwise(callback)

Fires if no matching file was found in the `webroot`. Also fires if `false` was returned in the `delegate.before()` callback.

## License

Paperboy is licensed under the MIT license.

## Credits

* [Jan Lehnardt](http://twitter.com/janl) for coming up with the name "Paperboy"