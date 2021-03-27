var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var constants = require('./constants');

function Institution(db, basedir) {
  this.db = db;
  this.basedir = basedir;
}

Institution.prototype.get = function(req, res) {
  try {
    var institution = this.db.get('institution');
    var data = {
      institution: institution,
    }
    res.send(data);
  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Institution.prototype.update = function(req, res) {
  try {
    var institution = this.db.get('institution');
    institution.updated_at = new Date();
    institution.assign(req.body).write();
    
    var data = {
      institution: institution
    }
    res.send(data);
  
  } catch (e) {
    var data = {
      message: e.message
    }
    res.send(data);
  }  
}

Institution.prototype.getLogo = function(req, res) {
  try {
    var institution = this.db.get('institution').value();
    filepath = constants.BASEDIR + '/' + institution.logo;
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.sendFile(path.join(__dirname, '../public/assets/images/image-square.png'));
    }
  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Institution.prototype.getFile = function(req, res) {
  try {
    var filename = req.params.filename;
    filepath = constants.BASEDIR + '/' + filename;
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).send({ message: 'File not found' });
    }
  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Institution.prototype.updateLogo = function(req, res) {
  try {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename) => {
  
      var saveTo = constants.BASEDIR + '/' + filename;
      fstream = fs.createWriteStream(saveTo);
      file.pipe(fstream);

      var institution = this.db.get('institution');
      update = {
        logo: filename,
        updated_at: new Date()
      }
      institution.assign(update).write();

      fstream.on('close', function() {
        res.writeHead(200, { 'Connection': 'close' });
        res.end("That's all folks!");
      })
    });

  } catch (e) {
    var data = {
      message: e.message
    }
    res.send(data);
  }  
}

Institution.prototype.uploadFile = function(req, res) {
  try {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename) => {
      
      var ext = filename.split('.').pop();
      filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.' + ext;

      var saveTo = constants.BASEDIR + '/' + filename;
      fstream = fs.createWriteStream(saveTo);
      file.pipe(fstream);

      fstream.on('close', function() {
        res.writeHead(200, { 'Connection': 'close' });
        res.end("That's all folks!");
      })
    });

  } catch (e) {
    var data = {
      message: e.message
    }
    res.send(data);
  }  
}


Institution.prototype.upgradeLicense = function(req, res) {
  var hash = require("crypto").createHmac("sha256", constants.SECRET_KEY);

  var hashed = hash.update(constants.MAC_ADDRESS)
    .digest("base64");

  fs.writeFile(constants.BASEDIR+'/.keyfile', hashed, err => {
    if (err) {
      var data = {
        message: err
      }
      console.log(err);
      return res.send(data);
    } 
    console.log('Writing keyfile');
  });

  var data = {
    message: "Lisensi sudah diperbarui, silahkan restart aplikasi"
  }
  return res.send(data);
}

Institution.prototype.startup = function(req, res) {
  var hash = require("crypto").createHmac("sha256", constants.SECRET_KEY);

  var hashed = hash.update(constants.MAC_ADDRESS)
    .digest("base64");

  if (hashed === constants.KEY_STRING) {
    var data = {
      licensed: 'valid'
    }
  } else {
    var data = {
      licensed: 'invalid'
    }
  }
  return res.send(data);
}

module.exports = Institution;