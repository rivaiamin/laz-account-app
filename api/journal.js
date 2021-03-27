var xl = require('excel4node');
var fs = require('fs');
var os = require('os');
var path = require('path');
var collect = require('collect.js');
var xlsx = require('node-xlsx');
var crypto = require('crypto');

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
    },
  },
  currency: {
    numberFormat: 'Rp#,##0.00; Rp(#,##0.00); -',
  }
}

function Journal(db) {
  this.db = db;
}

Journal.prototype.get = function(req, res)  {
  var account_code = parseInt(req.query.account_code);
  if (account_code) {
    var account_level = req.query.account_code.length;
  }
  var from = req.query.from;
  var to = req.query.to;

  try {
    var journals = this.db.get('journals').orderBy('date', 'desc');
    var journal_ids = [];
    if (account_code) {
      // journals = journals.filter({ account_code: account_code });
      journals.value().forEach((item) => {
        var short = item.account_code.toString().substring(0, account_level);
        if (account_code == short) {
          journal_ids.push(item.journal_id);
        } 
      });
      
      journals = journals.filter(item => {
        // var short = item.account_code.toString().substring(0, account_level);
        return journal_ids.includes(item.journal_id);
      });
    }
    if (from && to) {
      from = new Date(from);
      from.setDate(from.getDate() - 1);
      to = new Date(to);
      to.setDate(to.getDate() + 1);

      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }

    var data = {
      journals: journals.value(),
      message: '',
    }
    res.send(data);
  } catch (e) {
    var data = {
      journals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Journal.prototype.export = function(req, res) {
  var account_code = parseInt(req.query.account_code);
  if (req.query.account_code) {
    var account_level = req.query.account_code.length;
  }
  var from = req.query.from;
  var to = req.query.to;
  
  var journals = this.db.get('journals');
  var accounts = collect(this.db.get('accounts').value()).keyBy('code').all();
  var institution = this.db.get('institution').value();
  
  try {
    var journal_ids = [];
    if (account_code) {
      // journals = journals.filter({ account_code: account_code });
      journals.value().forEach((item) => {
        var short = item.account_code.toString().substring(0, account_level);
        if (account_code == short) {
          journal_ids.push(item.journal_id);
        } 
      });
      
      journals = journals.filter(item => {
        // var short = item.account_code.toString().substring(0, account_level);
        return journal_ids.includes(item.journal_id);
      });
    }
    if (from && to) {
      from = new Date(from);
      from.setDate(from.getDate() - 1);
      to = new Date(to);
      to.setDate(to.getDate() + 1);

      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Jurnal');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);
    
    var row = 4;

    ws.column(1).setWidth(4);
    ws.column(2).setWidth(10);
    ws.column(3).setWidth(8);
    ws.column(4).setWidth(30);
    ws.column(5).setWidth(15);
    ws.column(6).setWidth(15);
    ws.column(7).setWidth(100);

    ws.cell(1, 1).string(institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string('LAPORAN JURNAL').style(header);
    ws.cell(row, 1).string('No.').style(bold);
    ws.cell(row, 2).string('Tanggal').style(bold);
    ws.cell(row, 3).string('Akun').style(bold);
    ws.cell(row, 4).string('Nama Akun').style(bold);
    ws.cell(row, 5).string('Debit').style(bold);
    ws.cell(row, 6).string('Kredit').style(bold);
    ws.cell(row, 7).string('Uraian').style(bold);

    journals.value().forEach(journal => {
      row++;

      date = new Date(journal.date);
      
      account_name = '';
      if (accounts[journal.account_code]) {
        account_name = accounts[journal.account_code].name;
      }

      ws.cell(row,1).number(journal.journal_id).style(normal);
      ws.cell(row,2).date(date).style(normal);
      ws.cell(row,3).number(journal.account_code).style(normal);
      ws.cell(row,4).string(account_name).style(normal);
      ws.cell(row,5).number(journal.debit).style(normal).style(currency);
      ws.cell(row,6).number(journal.credit).style(normal).style(currency);
      ws.cell(row,7).string(journal.description).style(normal);
    });
    
    ws.cell(4,1,row,7).style(cell);

    return wb.write('Excel.xlsx', res);

  } catch (e) {
    var data = {
      journals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Journal.prototype.getCash = function(req, res) {
  var from = req.query.from;
  var to = req.query.to;
  
  try {
    var journals = this.db.get('journals');
    var cash_accounts = this.db.get('accounts').filter({ parent_code: 11 }).map('code').value();
    // var institution = this.db.get('institution').value();

    if (from && to) {
      from = new Date(from);
      from.setDate(from.getDate() + 1);
      to = new Date(to);
      to.setDate(to.getDate() + 1);

      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });

    }

    journals = journals.groupBy('journal_id').value();
    var cashes = [];
    for (var i in journals) {
      var isCash = false;
      journals[i].forEach(journal => {
        if (cash_accounts.includes(journal.account_code)) {
          isCash = true;
        }; 
      });
      if (isCash) {
        cashes.push(journals[i]);
      }
    }

    var data = {
      cashes: cashes,
      message: '',
    }
    return res.send(data);

  } catch (e) {
    var data = {
      journals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Journal.prototype.exportCash = function(req, res) {
  var from = req.query.from;
  var to = req.query.to;
  
  try {
    var journals = this.db.get('journals');
    var accounts = collect(this.db.get('accounts').value()).keyBy('code').all();
    var cash_accounts = this.db.get('accounts').filter({ parent_code: 11 }).map('code').value();
    var institution = this.db.get('institution').value();

    if (from && to) {
      from = new Date(from);
      from.setDate(from.getDate() - 1);
      to = new Date(to);
      to.setDate(to.getDate() + 1);

      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }

    journals = journals.groupBy('journal_id').value();
    var cashes = [];
    // var cash_id = 110001;
    for (var i in journals) {
      var isCash = false;
      journals[i].forEach(journal => {
        if (cash_accounts.includes(journal.account_code)) {
          isCash = true;
        }; 
      });
      if (isCash) {
        cashes.push(journals[i]);
      }
    }

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Jurnal');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);
    
    ws.column(1).setWidth(5);
    ws.column(2).setWidth(10);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(10);

    var row = 4;
    ws.cell(1, 1).string(institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string('LAPORAN ARUS KAS').style(header);
    ws.cell(row, 1).string('No.').style(bold);
    ws.cell(row, 2).string('Tanggal').style(bold);
    ws.cell(row, 3).string('Deskripsi').style(bold);
    ws.cell(row, 4).string('Jumlah').style(bold);

    var no=1;
    var total = 0;
    cashes.forEach(group => {
      group.forEach(cash => {
        if (!cash_accounts.includes(cash.account_code)) {
          row++;
          date = new Date(cash.date);
          amount = cash.credit - cash.debit;
          total += amount;
          
          account_name = '';
          if (accounts[cash.account_code]) {
            account_name = accounts[cash.account_code].name
          }

          ws.cell(row,1).number(no++).style(normal);
          ws.cell(row,2).date(date).style(normal);
          ws.cell(row,3).string(account_name).style(normal);
          ws.cell(row,4).number(amount).style(normal).style(currency);
        }
      })
    });

    row++;
    ws.cell(row,1, row, 3, true).string("SALDO KAS").style(normal).style(bold);
    ws.cell(row,4).number(total).style(normal).style(bold).style(currency);
    
    ws.cell(4,1,row,4).style(cell);

    return wb.write('Arus_Kas.xlsx', res);

  } catch (e) {
    var data = {
      journals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Journal.prototype.exportCashFlow = function(req, res) {
  var from = req.query.from;
  var to = req.query.to;
  
  try {
    var journals = this.db.get('journals');
    var accounts = collect(this.db.get('accounts').value()).keyBy('code').all();
    var cash_accounts = this.db.get('accounts').filter({ parent_code: 11 }).map('code').value();
    var institution = this.db.get('institution').value();

    if (from && to) {
      from = new Date(from);
      from.setDate(from.getDate() - 1);
      to = new Date(to);
      to.setDate(to.getDate() + 1);

      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }

    journals = journals.groupBy('journal_id').value();
    var cashes = [];
    // var cash_id = 110001;
    for (var i in journals) {
      var isCash = false;
      journals[i].forEach(journal => {
        if (cash_accounts.includes(journal.account_code)) {
          isCash = true;
        }; 
      });
      if (isCash) {
        cashes.push(journals[i]);
      }
    }

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Jurnal');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);
    
    ws.column(1).setWidth(5);
    ws.column(2).setWidth(10);
    ws.column(3).setWidth(30);
    ws.column(4).setWidth(10);

    var row = 4;
    ws.cell(1, 1).string(institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string('LAPORAN ARUS KAS').style(header);
    ws.cell(row, 1).string('No.').style(bold);
    ws.cell(row, 2).string('Tanggal').style(bold);
    ws.cell(row, 3).string('Deskripsi').style(bold);
    ws.cell(row, 4).string('Jumlah').style(bold);

    var no=1;
    var total = 0;
    cashes.forEach(group => {
      group.forEach(cash => {
        if (!cash_accounts.includes(cash.account_code)) {
          row++;
          date = new Date(cash.date);
          amount = cash.credit - cash.debit;
          total += amount;
          
          account_name = '';
          if (accounts[cash.account_code]) {
            account_name = accounts[cash.account_code].name
          }

          ws.cell(row,1).number(no++).style(normal);
          ws.cell(row,2).date(date).style(normal);
          ws.cell(row,3).string(account_name).style(normal);
          ws.cell(row,4).number(amount).style(normal).style(currency);
        }
      })
    });

    row++;
    ws.cell(row,1, row, 3, true).string("SALDO KAS").style(normal).style(bold);
    ws.cell(row,4).number(total).style(normal).style(bold).style(currency);
    
    ws.cell(4,1,row,4).style(cell);

    return wb.write('Arus_Kas.xlsx', res);

  } catch (e) {
    var data = {
      journals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Journal.prototype.import = function(req, res) {

  try {
    req.pipe(req.busboy);
    var xlsxFile = '';
    response = {
      journals: []
    }

    lastJournal = this.db.get('journals').orderBy('date', 'desc').take(1).value()[0];
    var db = this.db;

    req.busboy.on('file', (fieldname, file, filename) => {
      var hash = crypto.randomBytes(20).toString('hex');
      xlsxFile = path.join(os.tmpdir(), hash);
      file.pipe(fs.createWriteStream(xlsxFile)).on('finish', function() {
        var workSheetsFromFile = xlsx.parse(xlsxFile);
        var i = 1;
        var curJournalID = 0;
        var idx = 0;
        lastID = null;
        workSheetsFromFile[0].data.forEach(row => {
          if (i > 4) {
            if (curJournalID != row[0]) {
              curJournalID = row[0];
              idx = 0;
            }
            var exists = db.get('journals').filter({ journal_id: curJournalID });
            
            var debit = 0;
            if (row[4]) {
              debit = row[4];
            }
            var credit = 0;
            if (row[5]) {
              credit = row[5];
            }

            if (row[0]) {
              journal = {
                journal_id: row[0],
                date: new Date((row[1] - (25569))*86400*1000),
                account_code: row[2],
                debit: debit,
                credit: credit,
                description: row[6],
                updated_at: new Date()
              };
              
              if (exists.value()[idx]) {
                var item = db.get('journals').find({ id: exists.value()[idx].id });
        
                if (item.value()) {
                  item.assign(journal).write();
                  response.journals.push(journal);
                }
              } else {
                if (idx == 0) {
                  lastJournal = db.get('journals').orderBy('id', 'desc').take(1).value();
                  if (lastJournal.length > 0) {
                    lastID = lastJournal[0].id;
                  } else {
                    lastID = 0;
                  }
                }
  
                journal.id = ++lastID;
                journal.created_at = new Date();
                db.get('journals').push(journal).write();
                response.journals.push(journal);
              }
              lastID = journal.id;
            }

            idx++;
          }
          
          i++;
        })

        res.send(response);
      });
    });

  } catch (e) {
    var data = {
      message: e.message
    }
    res.send(data);
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
    var journals = req.body;   

    lastJournal = this.db.get('journals').orderBy('id', 'desc').take(1).value()[0];
    var i = 1;
    journals.forEach(journal => {
      if (lastJournal) {
        journal.id = lastJournal.id + i;
        journal.journal_id = lastJournal.journal_id + 1;
      } else {
        journal.id = i;
        journal.journal_id = 1;
      }
      journal.created_at = journal.updated_at = new Date();

      this.db.get('journals').push(journal).write();
      i++;
    })
    
    var data = {
      journals: journals
    };
    
    res.send(data)
  
  } catch (e) {
    data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Journal.prototype.update = function(req, res) {
  try {
    var journals = req.body;
    var updated = [];
    journals.forEach(journal => {
      var item = this.db.get('journals').find({ id: journal.id });
      
      if (item.value()) {
        journal.updated_at = new Date();
        item.assign(journal).write();
        
        updated.push(journal);
      }
    })

    res.send({ journals: updated })

  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
  
}

Journal.prototype.delete = function(req, res) {
  try {
    var journal_id = parseInt(req.params.journal_id);
    this.db.get('journals').remove({ journal_id: journal_id }).write();
    
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