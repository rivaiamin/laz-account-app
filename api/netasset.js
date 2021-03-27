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
  }
}

function Netasset(db) {
  this.db = db;
}

function getNetassetByParams(db, params) {
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
  journals = collect(journals).groupBy('account_code').all();
  
  // collecting
  var netassets = {};
  for (var i in accounts[0]) {
    var acc0 = accounts[0][i].code;
    var key = acc0.toString();
    if (netassets[key] == undefined) netassets[key] = [];
    for (var j in accounts[acc0]) {
      var acc1 = accounts[acc0][j].code;
      for (var k in accounts[acc1]) {
        var code = accounts[acc1][k].code;
        var name = accounts[acc1][k].name;
        var aj = journals[code];
        if (journals[code]) {
          var debit = aj.sum('debit');
          var credit = aj.sum('credit');
          var netasset = {
            account_code: code,
            name: name,
            debit: debit,
            credit: credit,
          }
          netassets[key].push(netasset);
        }
      }
    }
  }

  // count totals
  var totals = {};
  for (var i in netassets) {
    if (!totals[i]) totals[i] = [];
    debit = netassets[i].reduce((a, b) => a + b.debit, 0);
    credit = netassets[i].reduce((a, b) => a + b.credit, 0);
    totals[i] = {
      debit: debit,
      credit: credit
    };
  }

  // Calculate for networth
  var input = {
    debit: 0,
    credit:0
  }
  netassets[4].forEach(finpos => {
    input.debit += finpos.debit;
    input.credit += finpos.credit;
  });
  var output = {
    debit: 0,
    credit:0
  }
  netassets[5].forEach(finpos => {
    output.debit += finpos.debit;
    output.credit += finpos.credit;
  });
  totals[0] = {
    debit: input.debit + output.debit,
    credit: input.credit + output.credit
  }

  var df = new Intl.DateTimeFormat('id', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });

  var data = {
    date: df.format(new Date()),
    institution: {
      name: institution.name,
      address: institution.address
    },
    netassets: netassets,
    totals: totals
  }

  return data;
}

Netasset.prototype.get = function(req, res)  {
  try {
    data = getNetassetByParams(this.db, req.query);
    data.message = '';

    res.send(data);

  } catch (e) {
    var data = {
      message: e.message,
    }
    res.status(500).send(data);
  }
}

Netasset.prototype.export = function(req, res) {
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
    var ret = getNetassetByParams(this.db, req.query);
    var netassets = ret.netassets;
    var totals = ret.totals;

    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Posisi_Keuangan');

    var normal = wb.createStyle(styles.normal);
    var header = wb.createStyle(styles.header);
    var bold = wb.createStyle(styles.bold);
    var cell = wb.createStyle(styles.cell);
    
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
    netassets['1'].forEach(netasset => {
      ws.cell(row,1).number(netasset.account_code).style(normal);
      ws.cell(row,2).string(netasset.name).style(normal);
      ws.cell(row,3).number(netasset.credit - netasset.debit).style(normal);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Aset').style(bold);
    ws.cell(row,3).number(totals['1'].credit - totals['1'].debit).style(normal);
    row+=2;

    // Lialibility
    var lialibility = totals['2'].debit - totals['2'].credit;
    ws.cell(row,1, row, 3, true).string('Liabilitas').style(bold).style(cell);
    row++;
    netassets['2'].forEach(netasset => {
      ws.cell(row,1).number(netasset.account_code).style(normal);
      ws.cell(row,2).string(netasset.name).style(normal);
      ws.cell(row,3).number(netasset.debit - netasset.credit).style(normal);
      row++;
    });
    ws.cell(row,1,row,2,true).string('Jumlah Liabilitas').style(bold);
    ws.cell(row,3).number(lialibility).style(normal);
    row+=2;
    
    // networth
    var networth = totals['0'].debit - totals['0'].credit;
    ws.cell(row,1, row, 3, true).string('Aset Bersih').style(bold).style(cell);
    row++;
    ws.cell(row,1,row,2,true).string('Jumlah Aset Bersih').style(bold);
    ws.cell(row,3).number(networth).style(normal);
    row+=2;

    // networth + liability
    ws.cell(row,1, row, 2, true).string('Jumlah Liabilitas dan Aset Bersih').style(bold).style(cell);
    ws.cell(row,3).number(lialibility + networth).style(normal);
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
      netassets: null,
      totals: null,
      message: e.message,
    }
    res.status(500).send(data);
  }
}

module.exports = Netasset;
