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