/**
 * ng-draggable.js - v0.1.3 - A lean AngularJS drag and drop directive.
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */

/* global angular */
angular
  .module('ng-draggable', [])
  .factory('DraggableService', function() {
    return {};
  })
  .directive('ngDrag', ['$document', 'DraggableService', function($document, DraggableService) {
    return {
      restrict: 'A',
      scope: {
        'callback': '&ngDrag',
        'disabled': '&ngDragDisabled'
      },
      link: function($scope, element) {
        var hasTouch = ('ontouchstart' in document.documentElement);
        var pressEvents = 'touchstart mousedown';
        var moveEvents = 'touchmove mousemove';
        var releaseEvents = 'touchend mouseup';

        var pressTimer = null;

        $scope.$watch('disabled()', function(value) {
          if (value) {
            element.addClass('ng-drag-disabled');
          }
        });

        var initialize = function() {
          // Prevent native drag
          element.attr('draggable', 'false');
          element.on(pressEvents, onPress);
        };

        var onPress = function(event) {
          if (!$scope.disabled()) {
            if (hasTouch) {
              cancelPress();
              pressTimer = setTimeout(function() {
                cancelPress();
                onLongPress(event);
              }, 100);
              $document.on(moveEvents, cancelPress);
              $document.on(releaseEvents, cancelPress);
            } else {
              // Disable right click
              if (event.button !== 2) {
                onLongPress(event);
              }
            }
          }
        };

        var cancelPress = function() {
          clearTimeout(pressTimer);
          $document.off(moveEvents, cancelPress);
          $document.off(releaseEvents, cancelPress);
        };

        var updateService = function(e) {
          $scope.$apply(function() {
            DraggableService.x = e.clientX;
            DraggableService.y = e.clientY;
            DraggableService.elementX = e.clientX - element.centerX;
            DraggableService.elementY = e.clientY - element.centerY;
            DraggableService.element = element;
          });
        };

        var onLongPress = function(e) {
          e.preventDefault();

          element[0].style.width = element[0].offsetWidth + 'px';
          element[0].style.height = element[0].offsetHeight + 'px';
          element.centerX = e.offsetX || e.layerX;
          element.centerY = e.offsetY || e.layerY;
          element.addClass('dragging');

          updateService(e);

          moveElement(DraggableService.elementX, DraggableService.elementY);

          $document.on(moveEvents, onMove);
          $document.on(releaseEvents, onRelease);
        };

        var onMove = function(e) {
          if (!$scope.disabled()) {
            e.preventDefault();

            updateService(e);

            moveElement(DraggableService.elementX, DraggableService.elementY);
          }
        };

        var onRelease = function(e) {
          if (!$scope.disabled()) {
            e.preventDefault();

            if (!$scope.disabled() && $scope.callback) {
              DraggableService.data = angular.copy($scope.callback());
            }

            updateService(e);

            element.removeClass('dragging');
            element.css({ left: '', top: '', position: '', 'z-index': '' });

            $document.off(moveEvents, onMove);
            $document.off(releaseEvents, onRelease);
          }
        };

        var moveElement = function(x, y) {
          element.css({ left: x + 'px', top: y + 'px' });
        };

        initialize();
      }
    };
  }])
  .directive('ngDrop', ['DraggableService', function(DraggableService) {
    return {
      restrict: 'A',
      scope: {
        'callback': '&ngDrop',
        'disabled': '&ngDropDisabled'
      },
      link: function($scope, element) {
        $scope.$watch(function() { return DraggableService.x }, function(x) {
          if (x) {
            isTouching(DraggableService.x, DraggableService.y, DraggableService.element);
          }
        });

        $scope.$watch(function() { return DraggableService.data }, function(data) {
          if (data) {
            if (!$scope.disabled() && isTouching(DraggableService.x, DraggableService.y, DraggableService.element)) {
              $scope.callback({ $data: data });
            }
            updateDragStyles(false, DraggableService.element);
          }
        });

        var isTouching = function(mouseX, mouseY, dragElement) {
          var touching = isTouchingElement(mouseX, mouseY);
          updateDragStyles(touching, dragElement);
          return touching;
        };

        var updateDragStyles = function(touching, dragElement) {
          if (touching) {
            element.addClass('ng-drag-enter');
            dragElement.addClass('ng-drag-over');
          } else {
            element.removeClass('ng-drag-enter');
            dragElement.removeClass('ng-drag-over');
          }
        };

        var isTouchingElement = function(x, y) {
          var rect = element[0].getBoundingClientRect();
          return x >= rect.left &&
            x <= rect.right &&
            y <= rect.bottom &&
            y >= rect.top;
        };
      }
    };
  }]);