const express = require('express');
// const logger = require('morgan');
const cors = require('cors');
const busboy = require('connect-busboy');
const path = require('path');
const bodyParser = require('body-parser');
const constants = require('./constants')

const _ = require('lodash');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');

const Institution = require("./institution");
const Account = require("./account");
const Journal = require("./journal");
const Ledger = require("./ledger");
const Finposition = require("./finposition");


// Cek directory
if (!fs.existsSync(constants.BASEDIR)){
  fs.mkdirSync(constants.BASEDIR);
}
if (!fs.existsSync(constants.BASEDIR+'/files')){
  fs.mkdirSync(constants.BASEDIR+'/files');
}
/* if (!fs.existsSync(constants.BASEDIR+'/templates')){
  fs.mkdirSync(constants.BASEDIR+'/templates');
  // destination.txt will be created or overwritten by default.
  fs.copyFile(__dirname+'/../templates/cashflows.docx', constants.BASEDIR+'/templates/cashflows.docx', (err) => {
    if (err) throw err;
    console.log('Template files copied to local system');
  });
} */

/* var pjson = require('../package.json');
const APP_ID = pjson.config.app_id; */

var db_path = path.join(constants.BASEDIR, 'db.json');

const adapter = new FileSync(db_path);
const db = low(adapter);

var exist = db.get('institution').value();
if (!exist) {

  var accounts_path = path.join(__dirname, '../data/accounts.'+constants.APP_ID+'.json');
  var banks_path = path.join(__dirname, '../data/banks.json');
  // Load default data
  let raw_accounts = fs.readFileSync(accounts_path);
  let accounts_data = JSON.parse(raw_accounts);
  let raw_banks = fs.readFileSync(banks_path);
  let banks = JSON.parse(raw_banks);
  // Set some defaults (required if your JSON file is empty)
  db.defaults({ 
    // banks: banks,
    accounts: accounts_data, 
    institution: {
      institution_id: "1",
      name: "Nama Lembaga",
      address: "",
      // institution_legal_file: "",
      // management_legal_file: "",
      managements: [],
      finances: [],
      files: []
    },
    journals: [],
  }).write();
}

// setup express
const app = express();
app.use(cors());
app.use(busboy());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/test', (req, res) => {
    res.send('Welcome to your express API');
});

// Accounts route
accounts = new Account(db);
app.get('/api/accounts', (req, res) => accounts.get(req, res));
app.get('/api/accounts/export', (req, res) => accounts.export(req, res));
app.get('/api/accounts/:code', (req, res) => accounts.findByID(req, res));
app.post('/api/accounts', (req, res) => accounts.create(req, res));
app.put('/api/accounts/:code', (req, res) =>  accounts.update(req, res));
app.delete('/api/accounts/:code', (req, res) => accounts.delete(req, res));

journals = new Journal(db);
app.get('/api/journals', (req, res) => journals.get(req, res));
app.get('/api/journals/export', (req, res) => journals.export(req, res));
app.post('/api/journals/import', (req, res) => journals.import(req, res));
app.get('/api/journals/:journal_id', (req, res) => journals.findByID(req, res));
app.post('/api/journals', (req, res) => journals.create(req, res));
app.put('/api/journals/:journal_id', (req, res) => journals.update(req, res));
app.delete('/api/journals/:journal_id', (req, res) => journals.delete(req, res));

app.get('/api/cashes/export', (req, res) => journals.exportCash(req, res));
app.get('/api/cashes', (req, res) => journals.getCash(req, res));

ledgers = new Ledger(db);
app.get('/api/ledgers', (req, res) => ledgers.get(req, res));
app.get('/api/ledgers/export', (req, res) => ledgers.export(req, res));

finpositions = new Finposition(db);
app.get('/api/finpositions', (req, res) => finpositions.get(req, res));
app.get('/api/finpositions/export', (req, res) => finpositions.export(req, res));
app.get('/api/finpositions/export/netasset', (req, res) => finpositions.exportNetasset(req, res));
app.get('/api/finpositions/export/cashflow', (req, res) => finpositions.exportCashflow(req, res));
app.get('/api/finpositions/export/activity', (req, res) => finpositions.exportActivity(req, res));

/* cashflows = new Cashflow(db);
app.get('/api/cashflows', (req, res) => cashflows.get(req, res));
app.get('/api/cashflows/reports', (req, res) => cashflows.export(req, res));
 */

institution = new Institution(db, constants.BASEDIR);
app.get('/api/startup', (req, res) => institution.startup(req, res));
app.get('/api/institution', (req, res) => institution.get(req, res));
app.put('/api/institution', (req, res) => institution.update(req, res));
app.post('/api/institution/logo', (req, res) => institution.updateLogo(req, res));
app.post('/api/institution/file', (req, res) => institution.uploadFile(req, res));
app.get('/api/institution/logo', (req, res) => institution.getLogo(req, res));
app.get('/api/institution/file/:filename', (req, res) => institution.getFile(req, res));
app.post('/api/institution/upgrade', (req, res) => institution.upgradeLicense(req, res));

app.listen(5000, () => console.log('App running on port 5000 🔥'));
