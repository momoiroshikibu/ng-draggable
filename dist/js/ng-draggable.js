/**
 * ng-draggable.js - v0.1.0 - A lean AngularJS drag and drop directive.
 * Based on ngDraggable (https://github.com/fatlinesofcode/ngDraggable)
 * Planned changes:
 *    - Remove event system
 *    - Improve code quality
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */

/* global angular */
angular
  .module('ng-draggable', [])
  .factory('DraggableService', function() {
    return {};
  })
  .directive('ngDrag', ['$rootScope', '$document', 'DraggableService', function($rootScope, $document, DraggableService) {
    return {
      restrict: 'A',
      scope: {
        'callback': '&ngDrag',
        'disabled': '&ngDragDisabled'
      },
      link: function($scope, element) {
        var _mx, _my, _tx, _ty;
        var _hasTouch = ('ontouchstart' in document.documentElement);
        var _pressEvents = 'touchstart mousedown';
        var _moveEvents = 'touchmove mousemove';
        var _releaseEvents = 'touchend mouseup';

        var _pressTimer = null;

        $scope.$watch('disabled()', function(value) {
          if (value) {
            element.addClass('ng-drag-disabled');
          }
        });

        var initialize = function() {
          // Prevent native drag
          element.attr('draggable', 'false');
          element.on(_pressEvents, onpress);
          if (!_hasTouch) {
            element.on('mousedown', function() {
              return false;
            });
          }
        };

        var onpress = function(event) {
          if (!$scope.disabled()) {
            if (_hasTouch) {
              cancelPress();
              _pressTimer = setTimeout(function() {
                cancelPress();
                onLongPress(event);
              }, 100);
              $document.on(_moveEvents, cancelPress);
              $document.on(_releaseEvents, cancelPress);
            } else {
              onLongPress(event);
            }
          }
        };

        var cancelPress = function() {
          clearTimeout(_pressTimer);
          $document.off(_moveEvents, cancelPress);
          $document.off(_releaseEvents, cancelPress);
        };

        var onLongPress = function(event) {
          event.preventDefault();

          element[0].style.width = element[0].offsetWidth + 'px';
          element[0].style.height = element[0].offsetHeight + 'px';
          element.centerX = event.offsetX || event.layerX;
          element.centerY = event.offsetY || event.layerY;
          element.addClass('dragging');

          _mx = event.pageX || event.clientX + $document[0].body.scrollLeft;
          _my = event.pageY || event.clientY + $document[0].body.scrollTop;
//          _mx = (event.pageX || event.originalEvent.touches[0].pageX);
//          _my = (event.pageY || event.originalEvent.touches[0].pageY);

          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;

          moveElement(_tx, _ty);

          $document.on(_moveEvents, onMove);
          $document.on(_releaseEvents, onRelease);

          $rootScope.$broadcast('draggable:start', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element });

          if ($scope.callback) {
            DraggableService.data = $scope.callback();
          }
        };

        var onMove = function(event) {
          event.preventDefault();

          _mx = event.pageX || event.clientX + $document[0].body.scrollLeft;
          _my = event.pageY || event.clientY + $document[0].body.scrollTop;
          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;
          moveElement(_tx, _ty);

          $rootScope.$broadcast('draggable:move', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element });
        };

        var onRelease = function(event) {
          event.preventDefault();

          $rootScope.$broadcast('draggable:end', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, callback: onDragComplete});
          element.removeClass('dragging');

          reset();

          $document.off(_moveEvents, onMove);
          $document.off(_releaseEvents, onRelease);
        };

        var onDragComplete = function() {
          if ($scope.callback) {
            $scope.callback();
          }
        };

        var reset = function() {
          element.css({left: '', top: '', position: '', 'z-index': ''});
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
        var initialize = function() {
          $scope.$on('draggable:start', onDragStart);
          $scope.$on('draggable:move', onDragMove);
          $scope.$on('draggable:end', onDragEnd);
        };

        var onDragStart = function(event, obj) {
          isTouching(obj.x, obj.y, obj.element);
        };

        var onDragMove = function(event, obj) {
          isTouching(obj.x, obj.y, obj.element);
        };

        var onDragEnd = function(event, obj) {
          if (!$scope.disabled() && isTouching(obj.x, obj.y, obj.element)) {
            $scope.$apply(function() {
              $scope.callback({ $data: DraggableService.data });
            });
          }
          updateDragStyles(false, obj.element);
        };

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

        initialize();
      }
    };
  }]);
