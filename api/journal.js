function Journal(db) {
  this.db = db;
}

Journal.prototype.get = function(req, res)  {
  var account_code = parseInt(req.query.account_code);
  var from = req.query.from;
  var to = req.query.to;
  
  var journals = this.db.get('journals');
  
  try {
    if (account_code) {
      journals = journals.filter({ account_code: account_code });
    }
    if (from && to) {
      from = new Date(from);
      to = new Date(to);
      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }

    var data = {
      journals: journals.value()
    }
    res.send(data);
  } catch (e) {
    var data = {
      message: e
    }
    res.status(500).send(data);
  }
}

Journal.prototype.findByID = function(req, res) {
  try {
    var code = parseInt(req.params.code);
    var journal = this.db.get('journals').find({ code: code }).value();
    var data = {
      journal: journal
    }
    res.send(data);
  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Journal.prototype.create = function(req, res) {
  try {
    var journal = req.body;
    
    existed = this.db.get('journals').find({code: journal.code});

    if (!existed.value()) {
      journal.created_at = journal.updated_at = new Date();
      this.db.get('journals').push(req.body).write();
      
      var data = {
        journal: journal
      };
      
      res.send(data)
    } else {
      var data = {
        message: "Sudah ada kode Ref yang sama"
      };
      
      res.status(403).send(data)
    }
  
  } catch (e) {
    data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Journal.prototype.update = function(req, res) {
  try {
    var code = req.params.code;
    var journal = this.db.get('journals').find({ code: code });
    
    if (journal.value()) {
      var patch = req.body;
      patch.updated_at = new Date();
      journal.assign(patch).write();
      
      var data = {
        journal: journal
      }
      res.send(data);
    
    } else {
      var data = {
        message: "Journal tidak ditemukan"
      }
      res.status(404).send(data);
    }

  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
  
}

Journal.prototype.delete = function(req, res) {
  try {
    var code = parseInt(req.params.code);
    this.db.get('journals').remove({ code: code }).write();
    
    var ret = {
      message: "journals deleted"
    }
    res.send(ret);

  } catch (e) {
    var ret = {
      message: e.message
    }
    res.status(500).send(ret);
  }
}

module.exports = Journal;