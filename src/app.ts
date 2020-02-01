import './app.scss';

import * as angular from 'angular';
import 'angular-sanitize';
import 'angular-resource';
import 'angular-ui-router';
import 'angular-messages';
import 'ng-file-upload';
import 'ngstorage';
import 'ng-file-upload';
import * as $ from 'jquery';
import 'popper.js';
import 'semantic-ui-css';

// import Handsontable from 'handsontable';
import { appConfig } from './app/app.config';
import { dashboardCtrl, psakCtrl, accountCtrl, journalCtrl, ledgerCtrl, finposCtrl, institutionCtrl } from './app/controllers';
import { accountFactory, journalFactory, institutionFactory } from './app/factories';

var api = "127.0.0.1:5000";

var base_url = api + '/api';

// var api = '//dev.smacc.id/backend/';
// var files = '//files.smacc.id/';
// var api2 = '//dev.smacc.id/';

var app = angular.module('psakApp', ['ui.router', 'ngSanitize', 'ngMessages', 'ngStorage', 'ngFileUpload' ]);

app
.constant('Env', {
	'base': '//'+base_url+'/',
  'secret_key': 'bc6ecd65d8035c021206eafef7b3c27d'
})
.config(appConfig)
// .component('formula', formula)
.factory('accountFactory', accountFactory)
.factory('journalFactory', journalFactory)
.factory('institutionFactory', institutionFactory)
.controller('psakCtrl', psakCtrl)
.controller('accountCtrl', accountCtrl)
.controller('journalCtrl', journalCtrl)
.controller('ledgerCtrl', ledgerCtrl)
.controller('finposCtrl', finposCtrl)
.controller('institutionCtrl', institutionCtrl)
.controller('dashboardCtrl', dashboardCtrl)
.directive('uiRadio', function() {
  return function(scope, elem) {
    $(elem).checkbox();
  }
})
.directive('uiDropdown', function() {
  return function(scope, elem) {
    $(elem).dropdown();
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
