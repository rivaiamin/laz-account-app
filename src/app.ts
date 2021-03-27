import './app.scss';

import * as angular from 'angular';
import 'angular-sanitize';
import 'angular-resource';
import 'angular-ui-router';
import 'angular-messages';
import 'ng-file-upload';
import 'ngstorage';
import 'ng-file-upload';
import  '../node_modules/angular-i18n/angular-locale_id-id.js';
import * as $ from 'jquery';
import 'popper.js';
import 'semantic-ui-css';

// import Handsontable from 'handsontable';
import { appConfig } from './app/app.config';
import { dashboardCtrl, psakCtrl, accountCtrl, journalCtrl, ledgerCtrl, cashCtrl, finpositionCtrl, initbalanceCtrl, netassetCtrl, activityCtrl, institutionCtrl } from './app/controllers';
import { accountFactory, journalFactory, reportFactory, institutionFactory } from './app/factories';

var api = "127.0.0.1:5000";
var base_url = api + '/api';

var pjson = require('../package.json');
const APP_ID = pjson.config.app_id;

var app = angular.module('psakApp', ['ui.router', 'ngSanitize', 'ngMessages', 'ngStorage', 'ngFileUpload' ]);

app
.constant('Env', {
	'base': '//'+base_url+'/',
  'secret_key': 'bc6ecd65d8035c021206eafef7b3c27d',
  'app_id': APP_ID,
  'app_name': APP_ID.toUpperCase()
})
.config(appConfig)
// .component('formula', formula)
.factory('accountFactory', accountFactory)
.factory('journalFactory', journalFactory)
.factory('reportFactory', reportFactory)
.factory('institutionFactory', institutionFactory)
.controller('psakCtrl', psakCtrl)
.controller('accountCtrl', accountCtrl)
.controller('journalCtrl', journalCtrl)
.controller('ledgerCtrl', ledgerCtrl)
.controller('finpositionCtrl', finpositionCtrl)
.controller('initbalanceCtrl', initbalanceCtrl)
.controller('netassetCtrl', netassetCtrl)
.controller('cashCtrl', cashCtrl)
.controller('activityCtrl', activityCtrl)
.controller('institutionCtrl', institutionCtrl)
.controller('dashboardCtrl', dashboardCtrl)
.directive('uiRadio', function() {
  return function(scope, elem) {
    $(elem).checkbox();
  }
})
.directive('uiAccordion', function() {
  return function(scope, elem) {
    $(elem).accordion();
  }
})
.directive('uiDropdown', function() {
  return function(scope, elem) {
    $(elem).dropdown({
      fullTextSearch: true,
      clearable: true
    });
  }
})
.directive('uiPopup', function() {
  return function(scope, elem) {
    $(elem).popup();
  }
})
.directive('uiTab', function() {
  return function(scope, elem) {
    $(elem).tab();
  }
})
.directive('uiModal', function() {
  return function(scope, elem) {
    $(elem).modal();
  }
})
.filter('slice', function() {
  return function(arr, start, end) {
    return arr.slice(start, end);
  };
});
