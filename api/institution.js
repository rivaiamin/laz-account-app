function Institution(db) {
  this.db = db;
}

Institution.prototype.get = function(req, res) {
  try {
    var institution = this.db.get('institution');
    var data = {
      institution: institution,
      message: "kok kosong"
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

Institution.prototype.updateLogo = function(req, res) {
  try {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
  
      var saveTo = path.join(basedir, filename);
      console.log(saveTo);
      file.pipe(fs.createWriteStream(saveTo));
      
    });

    var institution = db.get('institution');
    update = {
      logo: filename,
      updated_at: new Date()
    }
    institution.assign(update).write();
  
    busboy.on('finish', function() {
      res.writeHead(200, { 'Connection': 'close' });
      res.end("That's all folks!");
    });

    return req.pipe(busboy);  
  
  } catch (e) {
    var data = {
      message: e.message
    }
    res.send(data);
  }  
}

module.exports = Institution;