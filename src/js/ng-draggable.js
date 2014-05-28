/**
 * ng-draggable.js - v0.0.9 - A lean AngularJS drag and drop directive.
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
  .directive('ngDrag', ['$rootScope', '$parse', '$document', function($rootScope, $parse, $document) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        //   console.log("ngDraggable", "link", "", scope.value);
        //  return;
        var _mx, _my, _tx, _ty;
        var _hasTouch = ('ontouchstart' in document.documentElement);
        var _pressEvents = 'touchstart mousedown';
        var _moveEvents = 'touchmove mousemove';
        var _releaseEvents = 'touchend mouseup';

        var _data = null;

        var _pressTimer = null;

        var onDragSuccessCallback = $parse(attrs.ngDrag) || null;

        var initialize = function() {
          // Prevent native drag
          element.attr('draggable', 'false');
          toggleListeners(true);
        };

        var toggleListeners = function(enable) {
          if (!enable) return;

          scope.$on('$destroy', onDestroy);
          scope.$watch(attrs.ngDrag, onDragDataChange);
          element.on(_pressEvents, onpress);
          if (!_hasTouch) {
            element.on('mousedown', function() {
              return false;
            }); // prevent native drag
          }
        };
        var onDestroy = function() {
          toggleListeners(false);
        };
        var onDragDataChange = function(newVal) {
          _data = newVal;
          //   console.log("69","onDragDataChange","data", _data);
        };
        /*
         * When the element is clicked start the drag behaviour
         * On touch devices as a small delay so as not to prevent native window scrolling
         */
        var onpress = function(evt) {

          if (_hasTouch) {
            cancelPress();
            _pressTimer = setTimeout(function() {
              cancelPress();
              onlongpress(evt);
            }, 100);
            $document.on(_moveEvents, cancelPress);
            $document.on(_releaseEvents, cancelPress);
          } else {
            onlongpress(evt);
          }

        };
        var cancelPress = function() {
          clearTimeout(_pressTimer);
          $document.off(_moveEvents, cancelPress);
          $document.off(_releaseEvents, cancelPress);
        };
        var onlongpress = function(evt) {
          evt.preventDefault();
          element[0].style.width = element[0].offsetWidth + 'px';
          element[0].style.height = element[0].offsetHeight + 'px';
          element.centerX = evt.offsetX || evt.layerX;
          element.centerY = evt.offsetY || evt.layerY;
          element.addClass('dragging');

          _mx = evt.pageX || evt.clientX + $document[0].body.scrollLeft;
          _my = evt.pageY || evt.clientY + $document[0].body.scrollTop;
//          _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
//          _my = (evt.pageY || evt.originalEvent.touches[0].pageY);

          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;

          moveElement(_tx, _ty);
          $document.on(_moveEvents, onmove);
          $document.on(_releaseEvents, onrelease);
          $rootScope.$broadcast('draggable:start', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, data: _data});
        };
        var onmove = function(evt) {
          evt.preventDefault();

          _mx = evt.pageX || evt.clientX + $document[0].body.scrollLeft;
          _my = evt.pageY || evt.clientY + $document[0].body.scrollTop;
          _tx = _mx - element.centerX - $document[0].body.scrollLeft;
          _ty = _my - element.centerY - $document[0].body.scrollTop;
          moveElement(_tx, _ty);

          $rootScope.$broadcast('draggable:move', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, data: _data});
        };
        var onrelease = function(evt) {
          evt.preventDefault();
          $rootScope.$broadcast('draggable:end', {x: _mx, y: _my, tx: _tx, ty: _ty, element: element, data: _data, callback: onDragComplete});
          element.removeClass('dragging');
          reset();
          $document.off(_moveEvents, onmove);
          $document.off(_releaseEvents, onrelease);
        };
        var onDragComplete = function(evt) {

          if (!onDragSuccessCallback)return;

          scope.$apply(function() {
            onDragSuccessCallback(scope, {$data: _data, $event: evt});
          });
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
  .directive('ngDrop', ['$parse', '$timeout', function($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var onDropCallback = $parse(attrs.ngDrop);// || function(){};
        var initialize = function() {
          toggleListeners(true);
        };

        var toggleListeners = function(enable) {
          // remove listeners

          if (!enable)return;
          // add listeners.

          scope.$on('$destroy', onDestroy);
          //scope.$watch(attrs.uiDraggable, onDraggableChange);
          scope.$on('draggable:start', onDragStart);
          scope.$on('draggable:move', onDragMove);
          scope.$on('draggable:end', onDragEnd);
        };
        var onDestroy = function() {
          toggleListeners(false);
        };

        var onDragStart = function(evt, obj) {

          isTouching(obj.x, obj.y, obj.element);
        };
        var onDragMove = function(evt, obj) {

          isTouching(obj.x, obj.y, obj.element);
        };
        var onDragEnd = function(evt, obj) {
          if (isTouching(obj.x, obj.y, obj.element)) {
            // call the ngDraggable element callback
            if (obj.callback) {
              obj.callback(evt);
            }

            // Call the ng-drop callback
            scope.$apply(function() {
              onDropCallback(scope, { $data: obj.data, $event: evt });
            });
          }
          updateDragStyles(false, obj.element);
        };
        var isTouching = function(mouseX, mouseY, dragElement) {
          var touching = hitTest(mouseX, mouseY);
          updateDragStyles(touching, dragElement);
          return touching;
        };
        var updateDragStyles = function(touching, dragElement) {
          if (touching) {
            element.addClass('drag-enter');
            dragElement.addClass('drag-over');
          } else {
            element.removeClass('drag-enter');
            dragElement.removeClass('drag-over');
          }
        };
        var hitTest = function(x, y) {
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
