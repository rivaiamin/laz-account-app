var xl = require('excel4node');
var collect = require('collect.js');

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
    numberFormat: '$#,##0.00; ($#,##0.00); -',
  }
}

function Ledger(db) {
  this.db = db;
}

function getLedgerByParams(db, params) {
  var account_code = params.account_code;
  if (params.account_code) {
    var account_level = params.account_code.length;
  }
  var from = params.from;
  var to = params.to;

  var journals = db.get('journals');
  var institution = db.get('institution').value();

  if (account_code) {
    // journals = journals.filter({ account_code: account_code });
    journals = journals.filter(item => {
      var short = item.account_code.toString().substring(0, account_level);
      return account_code == short;
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

  // Generate ledgers
  var ledgers = [];
  var balance = 0;
  var total = {
    debit: 0,
    credit: 0,
    balance: 0,
  };

  journals.value().forEach(journal => {
    balance += journal.debit;
    balance -= journal.credit;
    total.debit += journal.debit;
    total.credit += journal.credit * -1;
    ledgers.push({
      journal_id: journal.id,
      account_code: journal.account_code,
      date: journal.date,
      description: journal.description,
      debit: journal.debit,
      credit: journal.credit * -1,
      balance: balance
    })
  });
  total.balance = balance;

  return {
    ledgers: ledgers,
    total: total,
    institution: {
      name: institution.name,
      address: institution.address
    }
  }
}

Ledger.prototype.get = function(req, res)  {
  try {
    ret = getLedgerByParams(this.db, req.query);
    
    var data = {
      ledgers: ret.ledgers,
      total: ret.total,
      message: '',
    }
    res.send(data);

  } catch (e) {
    var data = {
      ledgers: null,
      total: null,
      message: e.message,
      trace: e.trace,
    }
    res.status(500).send(data);
  }
}

Ledger.prototype.export = function(req, res) {
  try {
    var from = null;
    var to = null;
    if (req.query.from) {
      from = new Date(req.query.from);
    }
    if (req.query.to) {
      to = new Date(req.query.to);
    }

    var account_code = parseInt(req.query.account_code);

    var accounts = collect(this.db.get('accounts').value()).keyBy('code').all();
    var ret = getLedgerByParams(this.db, req.query);
    var ledgers = ret.ledgers;
    var total = ret.total;

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Jurnal');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    
    ws.cell(1, 1).string(ret.institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string('LAPORAN BUKU BESAR').style(header);
    ws.cell(3, 1).string('Periode').style(bold);
    if (from) {
      ws.cell(3, 2).date(from).style(normal);
    }
    ws.cell(3, 3).string('-').style(normal);
    if (to) {
      ws.cell(3, 4).date(to).style(normal);
    }
    ws.cell(4, 1).string('No Akun').style(bold);
    ws.cell(4, 2).number(account_code).style(normal);
    ws.cell(5, 1).string('Nama Akun').style(bold);
    ws.cell(5, 2).string(accounts[account_code].name).style(normal);
    
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(10);
    ws.column(3).setWidth(50);
    ws.column(4).setWidth(10);
    ws.column(5).setWidth(10);
    ws.column(6).setWidth(10);

    var row = 7;
    ws.cell(row, 1).string('No.').style(bold).style(cell);
    ws.cell(row, 2).string('Tanggal').style(bold).style(cell);
    ws.cell(row, 3).string('Uraian').style(bold).style(cell);
    ws.cell(row, 4).string('Debit').style(bold).style(cell);
    ws.cell(row, 5).string('Kredit').style(bold).style(cell);
    ws.cell(row, 6).string('Saldo').style(bold).style(cell);

    ledgers.forEach(ledger => {
      row++;

      date = new Date(ledger.date);

      ws.cell(row,1).number(ledger.journal_id).style(normal);
      ws.cell(row,2).date(date).style(normal);
      ws.cell(row,3).string(ledger.description).style(normal);
      ws.cell(row,4).number(ledger.debit).style(normal);
      ws.cell(row,5).number(ledger.credit).style(normal);
      ws.cell(row,6).number(ledger.balance).style(normal);
    });

    row++;
    ws.cell(row,1, row, 3, true).string('TOTAL').style(bold);
    ws.cell(row,4).number(total.debit).style(bold);
    ws.cell(row,5).number(total.credit).style(bold);
    ws.cell(row,6).number(total.balance).style(bold);

    ws.cell(7,1,row,6).style(cell);
    
    return wb.write('Buku_Besar.xlsx', res);

  } catch (e) {
    var data = {
      ledgers: null,
      total: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

module.exports = Ledger;
