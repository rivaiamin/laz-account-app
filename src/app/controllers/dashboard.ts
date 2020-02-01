import $ from 'jquery';

var dashboardCtrl = [ '$location', '$scope', '$state', function ($location, $scope, $state) {
  
  $("select.dropdown").dropdown();
  $('.menu .item').tab();
}];

export { dashboardCtrl };