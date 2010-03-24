var
  sys = require('sys'),
  events = require('events'),
  fs = require('fs'),
  path = require('path');

exports.filepath = function (webroot, url) {
  return path.join(webroot, (url === '/')  ? 'index.html' : url);
};

// (fab) middleware adapter
exports.fabware = function (webroot) {
  sys.puts("NOTICE: Fab middleware may not work on this fork.");
  
  return function (handler) {
    return function (respond) {
      var
        self = this,
        filepath = exports.filepath(webroot, this.url.pathname);

      fs.stat(filepath, function (err, stat) {
        if(err || !stat.isFile()){
          handler.call(self, respond);
        } else {
          exports.streamFile(filepath, stat, {
            sendHeader: function (status, headers) {
              respond({
                status: status,
                headers: headers
              });
            },
            write: function (chunk, encoding) {
              respond({
                body: chunk || '',
                '_encoding': encoding
              });
            },
            close: function () {
              respond(null);
            }
          });
        }
      });
    };
  };
};

exports.streamFile = function (filepath, stat, res) {
  var
    promise = new events.EventEmitter(),
    encoding = "binary",
    extension = filepath.split('.').slice(-1),
    contentType = exports.contentTypes[extension] || 'application/octet-stream',
    charset = exports.charsets[contentType];

  if (charset) {
    contentType += '; charset: ' + charset;
  }

  res.sendHeader(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size
  });

  fs.createReadStream(filepath)
    .addListener("data", function(chunk){
      res.write(chunk || '', encoding);
    })
    .addListener("end", function(){
      res.close();
      promise.emit("success");
    })
    .addListener("error", function (e) {
      promise.emit("error", e);
    });

  return promise;
};

exports.deliver = function (webroot, req, res) {
  var
    stream,
    beforeCallback,
    afterCallback,
    otherwiseCallback,
    errorCallback,
    filepath = exports.filepath(webroot, req.url),
    delegate = {
      error: function (callback) {
        errorCallback = callback;
        return delegate;
      },
      before: function (callback) {
        beforeCallback = callback;
        return delegate;
      },
      after: function (callback) {
        afterCallback = callback;
        return delegate;
      },
      otherwise: function (callback) {
        otherwiseCallback = callback;
        return delegate;
      }
    };
  
  fs.stat(filepath, function (err, stat) {
    if( (err || !stat.isFile()) && otherwiseCallback) {
      otherwiseCallback();
    } else {
      cancel = beforeCallback && (beforeCallback() === false);
      
      if (cancel && otherwiseCallback) {
        otherwiseCallback();
      } else {
        stream = exports.streamFile(filepath, stat, res);
        
        if(afterCallback){
          stream.addListener("success", afterCallback);
        }
        
        if(errorCallback){
          stream.addListener("error", errorCallback);
        }
      }
    }
  });
  
  return delegate;
};

exports.contentTypes = {
  "aiff": "audio/x-aiff",
  "arj": "application/x-arj-compressed",
  "asf": "video/x-ms-asf",
  "asx": "video/x-ms-asx",
  "au": "audio/ulaw",
  "avi": "video/x-msvideo",
  "bcpio": "application/x-bcpio",
  "ccad": "application/clariscad",
  "cod": "application/vnd.rim.cod",
  "com": "application/x-msdos-program",
  "cpio": "application/x-cpio",
  "cpt": "application/mac-compactpro",
  "csh": "application/x-csh",
  "css": "text/css",
  "deb": "application/x-debian-package",
  "dl": "video/dl",
  "doc": "application/msword",
  "drw": "application/drafting",
  "dvi": "application/x-dvi",
  "dwg": "application/acad",
  "dxf": "application/dxf",
  "dxr": "application/x-director",
  "etx": "text/x-setext",
  "ez": "application/andrew-inset",
  "fli": "video/x-fli",
  "flv": "video/x-flv",
  "gif": "image/gif",
  "gl": "video/gl",
  "gtar": "application/x-gtar",
  "gz": "application/x-gzip",
  "hdf": "application/x-hdf",
  "hqx": "application/mac-binhex40",
  "html": "text/html",
  "ice": "x-conference/x-cooltalk",
  "ief": "image/ief",
  "igs": "model/iges",
  "ips": "application/x-ipscript",
  "ipx": "application/x-ipix",
  "jad": "text/vnd.sun.j2me.app-descriptor",
  "jar": "application/java-archive",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "latex": "application/x-latex",
  "lsp": "application/x-lisp",
  "lzh": "application/octet-stream",
  "m": "text/plain",
  "m3u": "audio/x-mpegurl",
  "man": "application/x-troff-man",
  "me": "application/x-troff-me",
  "midi": "audio/midi",
  "mif": "application/x-mif",
  "mime": "www/mime",
  "movie": "video/x-sgi-movie",
  "mp4": "video/mp4",
  "mpg": "video/mpeg",
  "mpga": "audio/mpeg",
  "ms": "application/x-troff-ms",
  "nc": "application/x-netcdf",
  "oda": "application/oda",
  "ogm": "application/ogg",
  "pbm": "image/x-portable-bitmap",
  "pdf": "application/pdf",
  "pgm": "image/x-portable-graymap",
  "pgn": "application/x-chess-pgn",
  "pgp": "application/pgp",
  "pm": "application/x-perl",
  "png": "image/png",
  "pnm": "image/x-portable-anymap",
  "ppm": "image/x-portable-pixmap",
  "ppz": "application/vnd.ms-powerpoint",
  "pre": "application/x-freelance",
  "prt": "application/pro_eng",
  "ps": "application/postscript",
  "qt": "video/quicktime",
  "ra": "audio/x-realaudio",
  "rar": "application/x-rar-compressed",
  "ras": "image/x-cmu-raster",
  "rgb": "image/x-rgb",
  "rm": "audio/x-pn-realaudio",
  "rpm": "audio/x-pn-realaudio-plugin",
  "rtf": "text/rtf",
  "rtx": "text/richtext",
  "scm": "application/x-lotusscreencam",
  "set": "application/set",
  "sgml": "text/sgml",
  "sh": "application/x-sh",
  "shar": "application/x-shar",
  "silo": "model/mesh",
  "sit": "application/x-stuffit",
  "skt": "application/x-koan",
  "smil": "application/smil",
  "snd": "audio/basic",
  "sol": "application/solids",
  "spl": "application/x-futuresplash",
  "src": "application/x-wais-source",
  "stl": "application/SLA",
  "stp": "application/STEP",
  "sv4cpio": "application/x-sv4cpio",
  "sv4crc": "application/x-sv4crc",
  "swf": "application/x-shockwave-flash",
  "tar": "application/x-tar",
  "tcl": "application/x-tcl",
  "tex": "application/x-tex",
  "texinfo": "application/x-texinfo",
  "tgz": "application/x-tar-gz",
  "tiff": "image/tiff",
  "tr": "application/x-troff",
  "tsi": "audio/TSP-audio",
  "tsp": "application/dsptype",
  "tsv": "text/tab-separated-values",
  "unv": "application/i-deas",
  "ustar": "application/x-ustar",
  "vcd": "application/x-cdlink",
  "vda": "application/vda",
  "vivo": "video/vnd.vivo",
  "vrm": "x-world/x-vrml",
  "wav": "audio/x-wav",
  "wax": "audio/x-ms-wax",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "wmx": "video/x-ms-wmx",
  "wrl": "model/vrml",
  "wvx": "video/x-ms-wvx",
  "xbm": "image/x-xbitmap",
  "xlw": "application/vnd.ms-excel",
  "xml": "text/xml",
  "xpm": "image/x-xpixmap",
  "xwd": "image/x-xwindowdump",
  "xyz": "chemical/x-pdb",
  "zip": "application/zip"
};

exports.charsets = {
  'text/javascript': 'UTF-8',
  'text/html': 'UTF-8'
};