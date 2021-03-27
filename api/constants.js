const path = require('path');
const fs = require('fs');
const getMAC = require('getmac').default;
const homedir = require('os').homedir();


var pjson = require('../package.json');
const APP_ID = pjson.config.app_id;
const basedir = homedir + '/.'+APP_ID+'app';

// read license file
var key_string = '';
if (fs.existsSync(basedir+'/.keyfile')) {
  var license_path = path.join(basedir, '.keyfile');
  var key_string = fs.readFileSync(license_path, {encoding: 'utf8'});
}

module.exports = Object.freeze({
  MAC_ADDRESS: getMAC(),
  SECRET_KEY: '7Zcn5XlQLPTK7rmdyt89SJ5hq8N1lcjS',
  KEY_STRING: key_string,
  APP_ID: APP_ID,
  BASEDIR: basedir
});