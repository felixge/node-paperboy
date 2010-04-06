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
