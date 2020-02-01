
  
  function Account(db) {
    this.db = db;
  }

  Account.prototype.get = function(req, res) {
    try {
      var accounts = this.db.get('accounts');
      var data = {
        accounts: accounts
      }
      res.send(data);
    } catch (e) {
      var data = {
        message: e.message
      }
      res.status(500).send(data);
    }
  }

  Account.prototype.findByID = function(req, res) {
    try {
      var code = parseInt(req.params.code);
      var account = this.db.get('accounts').find({ code: code }).value();
      var data = {
        account: account
      }
      res.send(data);
    } catch (e) {
      var data = {
        message: e.message
      }
      res.status(500).send(data);
    }
  }

  Account.prototype.create = function(req, res) {
    try {
      account = req.body;
  
      existed = this.db.get('accounts').find({code: account.code});
  
      if (!existed.value()) {
        account.created_at = account.updated_at = new Date();
        this.db.get('accounts').push(account).write();
      
        data = {
          account: account 
        }
        res.send(data);
  
      } else {
        data = {
          message: 'Sudah ada kode akun yang sama'
        }
        res.status(403).send(data);
      }
    
    } catch (e) {
      data = {
        message: e.message
      }
      res.status(500).send(data);
    }
  }

  Account.prototype.update = function (req, res) {
    try {
      var code = parseInt(req.params.code);
      var account = this.db.get('accounts').find({ code: code });
      
      if (account.value()) {
        patch = req.body;
        patch.updated_at = new Date();
        account.assign(patch).write();
        
        var data = {
          account: account
        }
        res.send(data);
      } else {
        var data = {
          message: "Account not found"
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

  Account.prototype.delete = function(req, res) {
    try {
      var code = parseInt(req.params.code);
      this.db.get('accounts').remove({ code: code }).write();
      
      var ret = {
        message: "accounts deleted"
      }
      res.send(ret);
  
    } catch (e) {
      var ret = {
        message: e.message
      }
      res.status(500).send(ret);
    }
  }

module.exports = Account;