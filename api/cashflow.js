const collect = require('collect.js');
const Intl = require('intl');

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const homedir = require('os').homedir();
const basepath = homedir + '/.lasapp'
const fs = require('fs');
const path = require('path');

// Please make sure to use angular-expressions 1.0.1 or later
// More detail at https://github.com/open-xml-templating/docxtemplater/issues/488
var expressions = require('angular-expressions');
var merge = require("lodash/merge");

function Cashflow(db) {
  this.db = db;
}

// define your filter functions here, for example, to be able to write {clientname | lower}
expressions.filters.lower = function(input) {
    // This condition should be used to make sure that if your input is undefined, your output will be undefined as well and will not throw an error
    if(!input) return input;
    return input.toLowerCase();
}
function angularParser(tag) {
    if (tag === '.') {
        return {
            get: function(s){ return s;}
        };
    }
    const expr = expressions.compile(tag.replace(/(’|“|”|‘)/g, "'"));
    return {
        get: function(scope, context) {
            let obj = {};
            const scopeList = context.scopeList;
            const num = context.num;
            for (let i = 0, len = num + 1; i < len; i++) {
                obj = merge(obj, scopeList[i]);
            }
            return expr(scope, obj);
        }
    };
}

function generateDocx(data) {
  
  //Load the docx file as a binary
  var content = fs.readFileSync(path.resolve(basepath, 'templates/cashflows.docx'), 'binary');

  var zip = new PizZip(content);

  var doc = new Docxtemplater();
  doc.loadZip(zip).setOptions({parser:angularParser});

  //set the templateVariables
  doc.setData(data);

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render();
  } catch (error) {
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
    function replaceErrors(key, value) {
      if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (error, key) {
          error[key] = value[key];
          return error;
        }, {});
      }
      return value;
    }
    console.log(JSON.stringify({
      error: error
    }, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map(function (error) {
        return error.properties.explanation;
      }).join("\n");
      console.log('errorMessages', errorMessages);
      // errorMessages is a humanly readable message looking like this :
      // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
  }

  var buf = doc.getZip()
    .generate({
      type: 'nodebuffer'
    });

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  var outfile = path.resolve(basepath, 'files/output.docx');
  fs.writeFileSync(outfile, buf);
  return outfile;
}

Cashflow.prototype.get = function (req, res) {
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

Cashflow.prototype.export = function (req, res) {
  var from = req.query.from;
  var to = req.query.to;

  var journals = this.db.get('journals').value();
  var accounts = this.db.get('accounts').value();
  var institution = this.db.get('institution').value();
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
    var cashflows = {};

    // collecting
    for (var i in accounts[0]) {
      var acc0 = accounts[0][i].code;
      var key = acc0.toString();
      if (cashflows[key] == undefined) cashflows[key] = [];
      for (var j in accounts[acc0]) {
        var acc1 = accounts[acc0][j].code;
        for (var k in accounts[acc1]) {
          var code = accounts[acc1][k].code;
          var name = accounts[acc1][k].name;
          var aj = journals[code];
          if (journals[code]) {
            var debit = aj.sum('debit');
            var credit = aj.sum('credit');
            var cashflow = {
              account_code: code,
              name: name,
              debit: debit,
              credit: credit,
            }
            cashflows[key].push(cashflow);
          }
        }
      }
    }

    // count totals
    var totals = {};
    for (var i in cashflows) {
      if (!totals[i]) totals[i] = [];
      debit = cashflows[i].reduce((a, b) => a + b.debit, 0);
      credit = cashflows[i].reduce((a, b) => a + b.credit, 0);
      totals[i] = {
        debit: debit,
        credit: credit
      };
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
      cashflows: cashflows,
      totals: totals
    }
    if (outfile = generateDocx(data)) {
      res.download(outfile, 'cashflows '+data.date+'.docx');
    }
  } catch (e) {
    var data = {
      message: e.message
    }
    res.status(500).send(data);
  }
}

Cashflow.prototype.findByID = function (req, res) {

}

Cashflow.prototype.create = function (req, res) {

}

Cashflow.prototype.update = function (req, res) {

}

Cashflow.prototype.delete = function (req, res) {

}

module.exports = Cashflow;