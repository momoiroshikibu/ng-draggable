define(
  [
    'angular',
    'ng-draggable',
    'public/js/service/movie-service'
  ],
  function(angular) {
    'use strict';

    angular
      .module('ng-draggable-demo.home-controller', [
        'ng-draggable-demo',
        'ng-draggable-demo.movie-service',
        'ng-draggable'
      ])
      .controller('HomeController', [
        '$scope',
        'MovieService',
        function($scope, MovieService) {
          $scope.movieService = MovieService;
          $scope.onDropComplete = function($data, $event) {
            console.log($data);
            console.log($event);
          }
        }
      ]);
  }
);