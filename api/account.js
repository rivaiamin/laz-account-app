var xl = require('excel4node');

var styles = {
  normal: {
    font: {
      color: '#000000',
      size: 12,
      border: {
        outline: true
      }
    }
  },
  header: {
    font: {
      color: '#000000',
      size: 14,
      bold: true,
    }
  },
  bold: {
    font: {
      color: '#000000',
      size: 12,
      bold: true,
    }
  },
  cell: {
    border: {
      top: { style: 'thin', color: 'black' },
      right: { style: 'thin', color: 'black' },
      bottom: { style: 'thin', color: 'black' },
      left: { style: 'thin', color: 'black' }
    }
  }
}

function Account(db) {
  this.db = db;
}

Account.prototype.get = function(req, res) {
  try {
    var parent_code = parseInt(req.query.parent_code);
    
    var accounts = this.db.get('accounts')
    if (parent_code) {
      accounts = accounts.filter({parent_code: parent_code});
    }
    accounts = accounts.sortBy('sequence');
    
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

Account.prototype.export = function(req, res) {
  try {
    var accounts = this.db.get('accounts');
    var institution = this.db.get('institution').value();
    
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Akun');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    
    var row = 4;

    ws.column(1).setWidth(3);
    ws.column(2).setWidth(6);
    ws.column(3).setWidth(8);
    ws.column(4).setWidth(3);
    ws.column(5).setWidth(30);
    ws.column(6).setWidth(30);

    ws.cell(1, 1).string(institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string('Daftar Akun').style(header);
    ws.cell(row, 1).string('No.').style(bold);
    ws.cell(row, 4).string('Tingkat').style(bold);
    ws.cell(row, 2).string('Akun Induk').style(bold);
    ws.cell(row, 3).string('Nomor Akun').style(bold);
    ws.cell(row, 5).string('Nama Akun').style(bold);
    ws.cell(row, 6).string('Keterangan').style(bold);

    var num = 1;
    accounts.value().forEach(account => {
      row++;

      ws.cell(row, 1).number(num++).style(normal);
      ws.cell(row, 4).number(account.level).style(normal);
      ws.cell(row, 2).number(account.parent_code).style(normal);
      ws.cell(row, 3).number(account.code).style(normal);
      ws.cell(row, 5).string(account.name).style(normal);
      ws.cell(row, 6).string(account.description).style(normal);
    });

    ws.cell(3, 1, row, 6).style(cell);

    return wb.write('Excel.xlsx', res);
  } catch (e) {
    var data = {
      journals: null,
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