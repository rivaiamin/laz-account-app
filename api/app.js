const express = require('express');
// const logger = require('morgan');
const cors = require('cors');
const homedir = require('os').homedir();
const path = require('path');
const bodyParser = require('body-parser');
const Busboy = require('busboy');
const _ = require('lodash');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');

const Account = require("./account");
const Journal = require("./journal");
const Institution = require("./institution");
const Cashflow = require("./cashflow");

basedir = homedir + '/.lazapp';
if (!fs.existsSync(basedir)){
  fs.mkdirSync(basedir);
}

var db_path = path.join(basedir, 'db.json');
const adapter = new FileSync(db_path);
const db = low(adapter);

if (!fs.existsSync(basedir+'/db.json')) {
  var accounts_path = path.join(process.cwd(), 'data/accounts.json');
  var banks_path = path.join(process.cwd(), 'data/banks.json');
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
      institution_legal_file: "",
      management_legal_file: "",
      managements: [],
      finances: []
    },
    journals: [],
  }).write();
}

// setup express
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => {
    res.send('Welcome to your express API');
});

// Accounts route
accounts = new Account(db);
app.get('/api/accounts', (req, res) => accounts.get(req, res));
app.get('/api/accounts/:code', (req, res) => accounts.findByID(req, res));
app.post('/api/accounts', (req, res) => accounts.create(req, res));
app.put('/api/accounts/:code', (req, res) =>  accounts.update(req, res));
app.delete('/api/accounts/:code', (req, res) => accounts.delete(req, res));

journals = new Journal(db);
app.get('/api/journals', (req, res) => journals.get(req, res));
app.get('/api/journals/:code', (req, res) => journals.findByID(req, res));
app.post('/api/journals', (req, res) => journals.create(req, res));
app.put('/api/journals/:code', (req, res) => journals.update(req, res));
app.delete('/api/journals/:code', (req, res) => journals.delete(req, res));

cashflows = new Cashflow(db);
app.get('/api/cashflows', (req, res) => cashflows.get(req, res));
app.get('/api/cashflows/reports', (req, res) => cashflows.report(req, res));

institution = new Institution(db);
app.get('/api/institution', (req, res) => institution.get(req, res));
app.put('/api/institution', (req, res) => institution.update(req, res));
app.post('/api/institution/logo', (req, res) => institution.updateLogo(req, res));

app.listen(5000, () => console.log('App running on port 5000 🔥'));
