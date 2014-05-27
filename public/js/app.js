/**
 * Demo application for ng-draggable (https://github.com/ianwalter/ng-draggable)
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
define(
  [
    'angular',
    'angular-route',
    'public/js/controller/home-controller'
  ],
  function(angular) {
    'use strict';

    angular.module('ng-draggable-demo', [
        'ngRoute',
        'ng-draggable-demo.home-controller'
      ])
      .config(['$routeProvider', function($routeProvider) {
        $routeProvider
          .when('/', { controller: 'HomeController', templateUrl: 'public/template/home.html', label: 'Home' })
          .otherwise({ redirectTo: '/' });
      }]);
  }
);