const collect = require('collect.js');

function Cashflow(db) {
  this.db = db;
}

Cashflow.prototype.get = function(req, res) {
  var from = req.query.from;
  var to = req.query.to;
  
  var journals = this.db.get('journals').value();
  
  try {
    if (from && to) {
      from = new Date(from);
      to = new Date(to);
      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }
    
    journals = collect(journals).groupBy('account_code').all();
    cashflows = [];
    for (var code in journals) {
      var aj = journals[code];
      var debit = aj.sum('debit');
      var credit = aj.sum('credit');
      var cashflow = {
        account_code: code,
        debit: debit,
        credit: credit,
      }
      cashflows.push(cashflow);
    }

    var data = {
      cashflows: cashflows
    }
    res.send(data);
  } catch (e) {
    var data = {
      message: e
    }
    res.status(500).send(data);
  }
}

Cashflow.prototype.report = function(req, res) {
  var from = req.query.from;
  var to = req.query.to;
  
  var journals = this.db.get('journals').value();
  var accounts = this.db.get('accounts').value();
  accounts = collect(accounts).groupBy('parent_code').all();
  for (i in accounts) {
    accounts[i] = accounts[i].all();
  }
  
  try {
    if (from && to) {
      from = new Date(from);
      to = new Date(to);
      journals = journals.filter(item => {
        var date = new Date(item.date);
        return from <= date && to >= date;
      });
    }
    
    journals = collect(journals).groupBy('account_code').all();
    cashflows = {};

    for (var i in accounts[0]) {
      var acc0 = accounts[0][i].code;
      var key = acc0.toString();
      if (cashflows[key] == undefined) cashflows[key] = [];
      for (var j in accounts[acc0]) {
        var acc1 = accounts[acc0][j].code;
        for (var k in accounts[acc1]) {
          var code = accounts[acc1][k].code;
          var aj = journals[code];
          if (journals[code]) {
            var debit = aj.sum('debit');
            var credit = aj.sum('credit');
            var cashflow = {
              account_code: code,
              debit: debit,
              credit: credit,
            }
            cashflows[key].push(cashflow);
          }
        }
      }
    }

    var data = {
      cashflows: cashflows
    }
    res.send(data);
  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Cashflow.prototype.findByID = function(req, res) {

}

Cashflow.prototype.create = function(req, res) {

}

Cashflow.prototype.update = function(req, res) {

}

Cashflow.prototype.delete = function(req, res) {

}

module.exports = Cashflow;