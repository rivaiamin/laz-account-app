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
    }
  },
  currency: {
    numberFormat: '#,##0.00; (#,##0.00); -',
  }
}

function Finposition(db) {
  this.db = db;
}

function getFinpositionByParams(db, params) {
  var from = params.from;
  var to = params.to;
  var parent_code = params.parent_code;

  // collect data
  var journals = db.get('journals').value();
  var accounts = db.get('accounts').value();
  var institution = db.get('institution').value();
  
  // formatting master data
  accounts = collect(accounts).groupBy('parent_code').all();
  for (i in accounts) {
    accounts[i] = accounts[i].all();
  }
  if (params.initbalance) {
    journals = journals.filter(item => {
      return item.journal_id == 1;
    })
  } else if (from && to) {
    from = new Date(from);
    from.setDate(from.getDate() - 1);
    to = new Date(to);
    to.setDate(to.getDate() + 1);
    
    journals = journals.filter(item => {
      var date = new Date(item.date);
      return from <= date && to >= date;
    });
  }

  if (parent_code) {
    journals = journals.filter(item => {
      var shortcode = item.account_code.toString().substring(1, 2);
      var prefix = item.account_code.toString().substring(0, 1);
      return shortcode == parent_code.toString() && (prefix != "1" && prefix != "2");
    });
  }

  // collect balances accounts
  balance_accounts = [];
  balances = {};
  mas_balances = [];
  accounts[3].forEach(parent => {
    accounts[parent.code].forEach(account => {
      balance_accounts.push(account);
      var p = 'p' + account.code.toString().substring(1, 2);

      balances[p] = {
        code: parent.code,
        name: parent.name,
        total: 0,
      };

      code = account.code.toString()
      mas_balances.push({
        code: account.code,
        name: account.name,
        total: 0,
      });
    });
  });

  journals.forEach((journal) => {
    var o = journal.account_code.toString().substring(0, 1);
    var p = 'p' + journal.account_code.toString().substring(1, 2);
    var q = journal.account_code.toString().substring(1, 2) - 1;
    // var code = journal.account_code.toString();

    /* if (balances[p]) {
      if (o == '4') {
        balances[p].total += journal.credit - journal.debit;
      } else if (o == '5') {
        if (journal.account_code < 560000) {
          balances[p].total += journal.credit - journal.debit;
        }
      }
    } */

    if (o == '4' || o == '5') {
      if (journal.account_code < 540000) {
        balances['p1'].total += journal.credit - journal.debit;
      } else if (journal.account_code > 540000) {
        balances['p2'].total += journal.credit - journal.debit;
      }
    }

    if (mas_balances[q]) {
      if (o == '4') {
        mas_balances[q].total += journal.credit - journal.debit;
      } else if (o == '5') {
        if (journal.account_code < 560000) {
          mas_balances[q].total += journal.credit - journal.debit;
        }
      }
    }

    return true;
  });

  var first_journal = collect(journals).filter(item => {
    return item.journal_id == 1;
  }).all();
  journals = collect(journals).groupBy('account_code').all();
  
  // collecting
  var finpositions = {};
  for (var i in accounts[0]) {
    var acc0 = accounts[0][i].code;
    var key = acc0.toString();
    if (finpositions[key] == undefined) finpositions[key] = [];
    for (var j in accounts[acc0]) {
      var acc1 = accounts[acc0][j].code;
      for (var k in accounts[acc1]) {
        var code = accounts[acc1][k].code;
        var name = accounts[acc1][k].name;
        var aj = journals[code];
        if (journals[code]) {
          var debit = aj.sum('debit');
          var credit = aj.sum('credit');
          var finposition = {
            account_code: code,
            name: name,
            debit: debit,
            credit: credit,
          }
          finpositions[key].push(finposition);
        }
      }
    }
  }

  // Add to missing balance
  finpositions[3].forEach(finpos => {
    var i = finpos.account_code.toString().substring(5) - 1;
    var p = 'p' + finpos.account_code.toString().substring(1, 2);

    balances[p].total += finpos.credit - finpos.debit;
    mas_balances[i].total += finpos.credit - finpos.debit;
  });

  // count totals
  var totals = {};
  for (var i in finpositions) {
    if (!totals[i]) totals[i] = [];
    debit = finpositions[i].reduce((a, b) => a + b.debit, 0);
    credit = finpositions[i].reduce((a, b) => a + b.credit, 0);
    totals[i] = {
      debit: debit,
      credit: credit
    };
  }

  // Calculate for networth
  /* var input = {
    debit: 0,
    credit:0
  }
  finpositions[4].forEach(finpos => {
    input.debit += finpos.debit;
    input.credit += finpos.credit;
  });
  var output = {
    debit: 0,
    credit:0
  }
  finpositions[5].forEach(finpos => {
    output.debit += finpos.debit;
    output.credit += finpos.credit;
  });
  totals[0] = {
    debit: input.debit + output.debit,
    credit: input.credit + output.credit
  } */

  var df = new Intl.DateTimeFormat('id', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });

  var data = {
    date: df.format(new Date()),
    journals: journals,
    institution: {
      name: institution.name,
      address: institution.address
    },
    finpositions: finpositions,
    totals: totals,
    balances: balances,
    mas_balances: mas_balances,
    first_journal: first_journal,
  }

  return data;
}

Finposition.prototype.get = function(req, res)  {
  try {
    data = getFinpositionByParams(this.db, req.query);
    data.message = '';

    res.send(data);

  } catch (e) {
    var data = {
      message: e.message,
      trace: e.trace,
    }
    res.status(500).send(data);
  }
}

Finposition.prototype.export = function(req, res) {
  try {
    var from = null;
    var to = null;
    if (req.query.from) {
      from = new Date(req.query.from);
    }
    if (req.query.to) {
      to = new Date(req.query.to);
    }

    // var account_code = parseInt(req.query.account_code);

    // var accounts = collect(this.db.get('accounts').value()).keyBy('code').all();
    var ret = getFinpositionByParams(this.db, req.query);
    var finpositions = ret.finpositions;
    var balances = ret.balances;
    var mas_balances = ret.mas_balances;
    var totals = ret.totals;

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('LPK');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);
    
    ws.cell(1, 1).string(ret.institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string('LAPORAN POSISI KEUANGAN').style(header);
    ws.cell(3, 1).string('Periode').style(bold);
    if (from) {
      ws.cell(3, 2).date(from).style(normal);
    }
    ws.cell(3, 3).string('-').style(normal);
    if (to) {
      ws.cell(3, 4).date(to).style(normal);
    }
    
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(10);

    row = 5
    ws.cell(row, 1).string('No Akun').style(bold).style(cell);
    ws.cell(row, 2).string('Nama Akun').style(bold).style(cell);
    row++;
      
    // Asset
    ws.cell(row,1, row, 3, true).string('Aset').style(bold).style(cell);
    row++;
    finpositions['1'].forEach(finposition => {
      ws.cell(row,1).number(finposition.account_code).style(normal);
      ws.cell(row,2).string(finposition.name).style(normal);
      ws.cell(row,3).number(finposition.debit - finposition.credit).style(normal).style(currency);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Aset').style(bold);
    ws.cell(row,3).number(totals['1'].debit - totals['1'].credit).style(bold).style(currency);
    row+=2;

    // Lialibility
    var lialibility = totals['2'].debit - totals['2'].credit;
    ws.cell(row,1, row, 3, true).string('Liabilitas').style(bold).style(cell);
    row++;
    finpositions['2'].forEach(finposition => {
      ws.cell(row,1).number(finposition.account_code).style(normal);
      ws.cell(row,2).string(finposition.name).style(normal);
      ws.cell(row,3).number(finposition.debit - finposition.credit).style(normal).style(currency);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Liabilitas').style(bold);
    ws.cell(row,3).number(lialibility).style(bold).style(currency);
    row+=2;
    
    // balances
    total_balance = 0;
    Object.values(balances).forEach(balance => {
      total_balance += balance.total;
    })
    ws.cell(row,1, row, 3, true).string('Saldo Dana').style(bold).style(cell);
    row++;
    Object.values(balances).forEach(balance => {
      ws.cell(row,1).number(balance.code).style(normal);
      ws.cell(row,2).string(balance.name).style(normal);
      ws.cell(row,3).number(balance.total).style(normal).style(currency);
      row++;
    })
    ws.cell(row,1,row,2,true).string('Jumlah Saldo Dana').style(bold);
    ws.cell(row,3).number(total_balance).style(bold).style(currency);
    row+=2;

    // networth + liability
    ws.cell(row,1, row, 2, true).string('Jumlah Liabilitas dan Saldo Dana').style(bold).style(cell);
    ws.cell(row,3).number(total_balance + lialibility).style(bold).style(currency);
    row++;

    /* 
    row++;
    ws.cell(row,1, row, 3, true).string('TOTAL').style(bold);
    ws.cell(row,4).number(total.debit).style(bold);
    ws.cell(row,5).number(total.credit).style(bold);
    ws.cell(row,6).number(total.balance).style(bold); */

    ws.cell(5,1,row,3).style(cell);
    
    return wb.write('Posisi_Keuangan.xlsx', res);

  } catch (e) {
    var data = {
      finpositions: null,
      totals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Finposition.prototype.exportNetasset = function(req, res) {
  try {
    var from = null;
    var to = null;
    var parent_code = null;
    if (req.query.from) {
      from = new Date(req.query.from);
    }
    if (req.query.to) {
      to = new Date(req.query.to);
    }
    if (req.query.parent_code) {
      to = new Date(req.query.parent_code);
    }

    var ret = getFinpositionByParams(this.db, req.query);
    var finpositions = ret.finpositions;
    var totals = ret.totals;

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('LPD');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);

    var title = 'Laporan Aktivitas';
    ws.cell(1, 1).string(ret.institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string(title).style(header);
    ws.cell(3, 1).string('Periode').style(bold);
    if (from) {
      ws.cell(3, 2).date(from).style(normal);
    }
    ws.cell(3, 3).string('-').style(normal);
    if (to) {
      ws.cell(3, 4).date(to).style(normal);
    }
    
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(10);

    row = 5
    ws.cell(row, 1).string('No Akun').style(bold).style(cell);
    ws.cell(row, 2).string('Nama Akun').style(bold).style(cell);
    row++;
      
    // Income
    income = totals['4'].credit - totals['4'].debit;
    ws.cell(row,1, row, 3, true).string('Penerimaan').style(bold).style(cell);
    row++;
    finpositions['4'].forEach(finposition => {
      ws.cell(row,1).number(finposition.account_code).style(normal);
      ws.cell(row,2).string(finposition.name).style(normal);
      ws.cell(row,3).number(finposition.credit - finposition.debit).style(normal).style(currency);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Penerimaan').style(bold);
    ws.cell(row,3).number(income).style(bold).style(currency);
    row+=2;

    // Expense
    var expense = totals['5'].debit - totals['5'].credit;
    ws.cell(row,1, row, 3, true).string('Pengeluaran').style(bold).style(cell);
    row++;
    finpositions['5'].forEach(finposition => {
      ws.cell(row,1).number(finposition.account_code).style(normal);
      ws.cell(row,2).string(finposition.name).style(normal);
      ws.cell(row,3).number(finposition.debit - finposition.credit).style(normal).style(currency);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Pengeluaran').style(bold);
    ws.cell(row,3).number(expense).style(bold).style(currency);
    row+=2;

    ws.cell(row,1,row,2,true).string('Jumlah Perubahan Dana').style(bold);
    ws.cell(row,3).number(income - expense).style(bold).style(currency);

    /* 
    row++;
    ws.cell(row,1, row, 3, true).string('TOTAL').style(bold);
    ws.cell(row,4).number(total.debit).style(bold);
    ws.cell(row,5).number(total.credit).style(bold);
    ws.cell(row,6).number(total.balance).style(bold); */

    ws.cell(5,1,row,3).style(cell);
    
    return wb.write('Laporan_Aktivitas  .xlsx', res);

  } catch (e) {
    var data = {
      finpositions: null,
      totals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Finposition.prototype.exportCashflow = function(req, res) {
  try {
    var from = null;
    var to = null;
    var parent_code = null;
    if (req.query.from) {
      from = new Date(req.query.from);
    }
    if (req.query.to) {
      to = new Date(req.query.to);
    }
    if (req.query.parent_code) {
      to = new Date(req.query.parent_code);
    }

    var ret = getFinpositionByParams(this.db, req.query);
    var finpositions = ret.finpositions;
    var totals = ret.totals;

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('LPD');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);

    var title = 'Laporan Arus Kas';
    ws.cell(1, 1).string(ret.institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string(title).style(header);
    ws.cell(3, 1).string('Periode').style(bold);
    if (from) {
      ws.cell(3, 2).date(from).style(normal);
    }
    ws.cell(3, 3).string('-').style(normal);
    if (to) {
      ws.cell(3, 4).date(to).style(normal);
    }
    
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(10);

    row = 5
    ws.cell(row, 1).string('No Akun').style(bold).style(cell);
    ws.cell(row, 2).string('Nama Akun').style(bold).style(cell);
    row++;
      
    // Income
    total_income = totals['4'].credit - totals['4'].debit;
    ws.cell(row,1, row, 3, true).string('AKTIVITAS OPERASI').style(bold).style(cell);
    row++;
    finpositions['4'].forEach(finposition => {
      ws.cell(row,1).number(finposition.account_code).style(normal);
      ws.cell(row,2).string(finposition.name).style(normal);
      ws.cell(row,3).number(finposition.credit - finposition.debit).style(normal).style(currency);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Penerimaan').style(bold);
    ws.cell(row,3).number(total_income).style(bold).style(currency);
    row++;

    
    // Expense
    row++;
    var total_expense  = 0
    finpositions['5'].forEach(finposition => {
      if (finposition.account_code < 570000) {
        var expense = finposition.credit - finposition.debit;
        total_expense += expense;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(expense).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Kas Neto yang Diterima (Digunakan) Untuk Aktivitas Operasi').style(bold);
    ws.cell(row,3).number(total_expense).style(bold).style(currency);
    row+=2;

    // Invest
    ws.cell(row,1, row, 3, true).string('AKTIVITAS INVESTASI').style(bold).style(cell);
    row++;
    var total_invest = 0
    finpositions['5'].forEach(finposition => {
      if (finposition.account_code > 570000) {
        invest = finposition.credit - finposition.debit;
        total_invest += invest;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(invest).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Kas Neto yang Diterima (Digunakan) Untuk Aktivitas Investasi').style(bold);
    ws.cell(row,3).number(total_invest).style(bold).style(currency);
    row+=2;

    // Balance
    // total_balance = totals['3'].credit - totals['3'].debit;
    total_balance = 0;
    ws.cell(row,1, row, 3, true).string('AKTIVITAS PENDANAAN').style(bold).style(cell);
    row++;
    /* finpositions['3'].forEach(finposition => {
      ws.cell(row,1).number(finposition.account_code).style(normal);
      ws.cell(row,2).string(finposition.name).style(normal);
      ws.cell(row,3).number(finposition.credit - finposition.debit).style(normal).style(currency);
      row++;
    }); */
    ws.cell(row,1,row,2,true).string('Kas Neto yang Diterima (digunakan) untuk Aktivitas Pendanan').style(bold);
    ws.cell(row,3).number(total_balance).style(bold).style(currency);
    row+=2;

    var last_total = 0;
    ret.first_journal.forEach(journal => {
      if (journal.account_code > 110000 && journal.account_code <= 120000) {
        last_total += journal.debit - journal.credit;
      }
    });

    ws.cell(row,1,row,2,true).string('Kas dan Setara Kas Pada Awal Tahun').style(bold);
    ws.cell(row,3).number(last_total).style(bold).style(currency);
    row++;

    var total_final = total_income + total_expense + total_invest + total_balance;
    ws.cell(row,1,row,2,true).string('Kas dan Setara Kas Pada Akhir Tahun').style(bold);
    ws.cell(row,3).number(total_final + last_total).style(bold).style(currency);

    /* 
    row++;
    ws.cell(row,1, row, 3, true).string('TOTAL').style(bold);
    ws.cell(row,4).number(total.debit).style(bold);
    ws.cell(row,5).number(total.credit).style(bold);
    ws.cell(row,6).number(total.balance).style(bold); */

    ws.cell(5,1,row,3).style(cell);
    
    return wb.write('Laporan_Arus_Kas.xlsx', res);

  } catch (e) {
    var data = {
      finpositions: null,
      totals: null,
      message: e.stack,
    }
    res.status(500).send(data);
  }
}

Finposition.prototype.exportActivity = function(req, res) {
  try {
    var from = null;
    var to = null;
    var parent_code = null;
    if (req.query.from) {
      from = new Date(req.query.from);
    }
    if (req.query.to) {
      to = new Date(req.query.to);
    }
    if (req.query.parent_code) {
      to = new Date(req.query.parent_code);
    }

    var ret = getFinpositionByParams(this.db, req.query);
    var finpositions = ret.finpositions;
    var totals = ret.totals;

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('LPD');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    var currency = wb.createStyle(styles.currency);

    var title = 'Laporan Aktivitas';
    ws.cell(1, 1).string(ret.institution.name.toUpperCase()).style(header);
    ws.cell(2, 1).string(title).style(header);
    ws.cell(3, 1).string('Periode').style(bold);
    if (from) {
      ws.cell(3, 2).date(from).style(normal);
    }
    ws.cell(3, 3).string('-').style(normal);
    if (to) {
      ws.cell(3, 4).date(to).style(normal);
    }
    
    ws.column(1).setWidth(10);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(10);

    row = 5
    ws.cell(row, 1).string('No Akun').style(bold).style(cell);
    ws.cell(row, 2).string('Nama Akun').style(bold).style(cell);
    row++;
      
    ws.cell(row,1, row, 3, true).string('PERUBAHAN ASET NETO TERIKAT').style(bold).style(cell);
    row++;
    // Bound Income
    var total_bound_income = 0;
    ws.cell(row,1, row, 3, true).string('Pendapatan').style(bold).style(cell);
    row++;
    finpositions['4'].forEach(finposition => {
      if (finposition.account_code < 440000) {
        var income = finposition.credit - finposition.debit;
        total_bound_income += income;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(income).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Jumlah').style(bold);
    ws.cell(row,3).number(total_bound_income).style(bold).style(currency);
    row++;

    // Bound Expense
    var total_bound_expense = 0;
    ws.cell(row,1, row, 3, true).string('Beban').style(bold).style(cell);
    row++;
    finpositions['5'].forEach(finposition => {
      if (finposition.account_code < 540000) {
        var expense = finposition.credit - finposition.debit;
        total_bound_expense += expense;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(expense).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Jumlah').style(bold);
    ws.cell(row,3).number(total_bound_expense).style(bold).style(currency);
    row++;
    ws.cell(row,1,row,2,true).string('Kenaikan/Penurunan Aset Terikat').style(bold);
    ws.cell(row,3).number(total_bound_income + total_bound_expense).style(bold).style(currency);
    row+=2;

    ws.cell(row,1, row, 3, true).string('PERUBAHAN ASET NETO TIDAK TERIKAT').style(bold).style(cell);
    row++;
    // Unbound Income
    var total_unbound_income = 0;
    ws.cell(row,1, row, 3, true).string('Pendapatan').style(bold).style(cell);
    row++;
    finpositions['4'].forEach(finposition => {
      if (finposition.account_code > 440000) {
        var income = finposition.credit - finposition.debit;
        total_unbound_income += income;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(income).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Jumlah').style(bold);
    ws.cell(row,3).number(total_unbound_income).style(bold).style(currency);
    row++;

    // Unbound Expense
    var total_unbound_expense = 0;
    ws.cell(row,1, row, 3, true).string('Beban').style(bold).style(cell);
    row++;
    finpositions['5'].forEach(finposition => {
      if (finposition.account_code > 540000) {
        var expense = finposition.credit - finposition.debit;
        total_unbound_expense += expense;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(expense).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Jumlah').style(bold);
    ws.cell(row,3).number(total_unbound_expense).style(bold).style(currency);
    row++;
    ws.cell(row,1,row,2,true).string('Kenaikan/Penurunan Aset Neto Tidak Terikat').style(bold);
    ws.cell(row,3).number(total_unbound_income + total_unbound_expense).style(bold).style(currency);
    row+=2;
    
    ws.cell(row,1, row, 3, true).string('PERUBAHAN ASET NETO TIDAK TERIKAT LAINNYA').style(bold).style(cell);
    row++;
    // Unbound Other Income
    var total_unboundx_income = 0;
    ws.cell(row,1, row, 3, true).string('Pendapatan').style(bold).style(cell);
    row++;
    finpositions['4'].forEach(finposition => {
      if (finposition.account_code > 440000 && finposition.account_code < 460000) {
        var income = finposition.credit - finposition.debit;
        total_unboundx_income += income;
        ws.cell(row,1).number(finposition.account_code).style(normal);
        ws.cell(row,2).string(finposition.name).style(normal);
        ws.cell(row,3).number(income).style(normal).style(currency);
        row++;
      }
    });
    ws.cell(row,1,row,2,true).string('Jumlah').style(bold);
    ws.cell(row,3).number(total_unboundx_income).style(bold).style(currency);
    row++;
    
    var total_final = total_unbound_income + total_unbound_expense + total_bound_income + total_bound_expense;
    
    ws.cell(row,1,row,2,true).string('Perubahan Aset Neto').style(bold);
    ws.cell(row,3).number(total_final).style(bold).style(currency);
    row++;
    
    // last total
    var last_total = 0;
    if (ret.first_journal) {
      ret.first_journal.forEach(journal => {
        last_total += journal.credit;
      });
    }

    ws.cell(row,1,row,2,true).string('ASET NETO AWAL TAHUN').style(bold);
    ws.cell(row,3).number(last_total).style(bold).style(currency);
    row++;
    
    ws.cell(row,1,row,2,true).string('ASET NETO AKHIR TAHUN').style(bold);
    ws.cell(row,3).number(total_final + last_total).style(bold).style(currency);
    row++;

    ws.cell(5,1,row,3).style(cell);
    
    return wb.write('Laporan_Arus_Kas.xlsx', res);

  } catch (e) {
    var data = {
      finpositions: null,
      totals: null,
      message: e.stack,
    }
    console.error(e.stack);
    res.status(500).send(data);
  }
}


module.exports = Finposition;
