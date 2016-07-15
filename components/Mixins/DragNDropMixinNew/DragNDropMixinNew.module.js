/*global $ws, define, $ */
define('js!SBIS3.CONTROLS.DragNDropMixinNew', [
   'js!SBIS3.CONTROLS.DragObject',
   'js!WS.Data/Di'
], function (DragObject, Di) {
   'use strict';

   if (typeof window !== 'undefined') {
      var EventBusChannel = $ws.single.EventBus.channel('DragAndDropChannel');

      // Добавлены события для мультитач-девайсов
      // Для обработки используются уже существующие обработчики,
      // незначительно дополненные
      $(document).bind('mouseup touchend', function(e) {
         EventBusChannel.notify('onMouseup', e);
      });

      $(document).bind('mousemove touchmove', function (e) {
         EventBusChannel.notify('onMousemove', e);
      });

   }
   var

      buildTplArgsLV = function (cfg) {
         var tplOptions = cfg._buildTplArgsSt.call(this, cfg);
         tplOptions.multiselect = cfg.multiselect;
         tplOptions.decorators = this._decorators;
         tplOptions.colorField = cfg.colorField;

         return tplOptions;
      },
      DragAndDropMixin = /**@lends SBIS3.CONTROLS.DragNDropMixinNew.prototype*/{
         $protected: {
            _options:{
               dragEntity: undefined
            },
            _moveBeginX: null,
            _moveBeginY: null,
            //константа показывающая на сколько надо сдвинуть мышь, чтобы началось перемещение
            _constShiftLimit: 3,
            _dragEntity: undefined
         },
         //region public
         $constructor: function () {
            this._publish('onDragMove', 'onDragBegin', 'onDragEnd');
            $ws.single.EventBus.channel('DragAndDropChannel').subscribe('onMouseup', this.onMouseupOutside, this);
            $ws.single.EventBus.channel('DragAndDropChannel').subscribe('onMousemove', this.onMousemove, this);
         },

         init: function(){
            $(this.getContainer()).bind('mouseup touchend', this.onMouseupInside.bind(this));
         },

         /**
          * проверяет наличие контейнера
          * @param element
          * @returns {jQuery}
          */
         isDragDropContainer: function (element) {
            return $(element).hasClass('genie-dragdrop');
         },

         getDragEntity: function(options) {
            return  Di.resolve(this._options.dragEntity, options);
         },

         setDragEntity: function(dragEntityFactory) {
            this._options.dragEntity = dragEntityFactory;
            this._dragEntity = undefined;
         },
         //endregion public

         //region handlers
         _dropCache: function () {
         },
         /**
          * обработчик на Mousemove
          * @param e
          * @param element
          * @private
          */
         _onDrag: function (e, movable) {
            this._updateDragTarget(DragObject, e);
            var res = this._notify('onDragMove', DragObject, e);
            if (res !== false) {
              this._onDragHandler(DragObject, e);
            }
         },
         /**
          * оработчик на MoveOut
          * @param e
          * @param target
          * @private
          */
         _callMoveOutHandler: function (e) {
            throw new Error('Method callMoveOutHandler must be implemented');
         },
         /**
          * стандартный поиск контейнера
          * @param e
          * @param target
          * @returns {*}
          * @private
          */
         _findDragDropContainerStandart: function (e, target) {
            var elem = target;
            while (elem !== null && (!($(elem).hasClass('genie-dragdrop')))) {
               elem = elem.parentNode;
            }
            return elem;
         },
         /**
          * шаблонный метод endDropDown
          */
         _endDragHandler: function(dragObject, e) {

         },
         /**
          * шаблонный метод endDropDown
          */
         _onDragHandler: function(dragObject, e) {

         },
         /**
          * шаблонный метод beginDropDown
          */
         _beginDragHandler: function(dragObject, e) {

         },
         /**
          * Метод должен создать JQuery объект в котором будет лежать аватар
          * @returns {JQuery}
          */
         _createAvatar: function(dragObject, e) {

         },
         /**
          *
          */
         _updateDragTarget: function(dragObject, e) {

         },

         //endregion handlers

         //region protected
         /**
          * ищет контейнер
          * @param e
          * @param target
          * @returns {*}
          * @private
          */
         _findDragDropContainer: function (e, target) {
            return this._findDragDropContainerStandart(e, target);
         },

         /**
          * создает аватар
          * @param  {Event} e
          * @private
          */
         _showAvatar: function(e) {
            var avatar = this._createAvatar(DragObject, e);
            DragObject.setAvatar(avatar);
         },

         _initDrag: function(clickEvent) {
            var
               self = this,
               dragStrarter = function(bus, moveEvent){
                  if (self._isDrag(moveEvent)) {
                     self._beginDrag(clickEvent);
                     $ws.single.EventBus.channel('DragAndDropChannel').unsubscribe('onMousemove', dragStrarter);
                  }
               };
            this._moveBeginX = clickEvent.pageX;
            this._moveBeginY = clickEvent.pageY;
            $ws.single.EventBus.channel('DragAndDropChannel').subscribe('onMousemove', dragStrarter);
            $ws.single.EventBus.channel('DragAndDropChannel').once('onMouseup', function(){
               $ws.single.EventBus.channel('DragAndDropChannel').unsubscribe('onMousemove', dragStrarter);
            });
         },
         /**
          * Начало перетаскивания
          * @param e
          * @param movable
          */
         _beginDrag: function(e) {
            DragObject.reset();
            DragObject.onDragHandler(e);
            if (this._beginDragHandler(DragObject, e) !== false) {
               $('body').addClass('dragdropBody ws-unSelectable');
               if (this._notify('onDragBegin', DragObject, e) !== false) {
                  this._showAvatar(e);
                  DragObject.setOwner(this);
                  DragObject.setDragging(true);
               }
            }
            //TODO: Сейчас появилась проблема, что если к компьютеру подключен touch-телевизор он не вызывает
            //preventDefault и при таскании элементов мышкой происходит выделение текста.
            //Раньше тут была проверка !$ws._const.compatibility.touch и preventDefault не вызывался для touch устройств
            //данная проверка была добавлена, потому что когда в строке были отрендерены кнопки, при нажатии на них
            //и выполнении preventDefault впоследствии не вызывался click. Написал демку https://jsfiddle.net/9uwphct4/
            //с воспроизведением сценария, на iPad и Android click отрабатывает. Возможно причина была ещё в какой-то
            //ошибке. При возникновении ошибок на мобильных устройствах нужно будет добавить проверку !$ws._const.browser.isMobilePlatform.
            e.preventDefault();
         },

         /**
          * Метод определяет был ли сдвиг или просто кликнули по элементу
          * @param e
          * @returns {boolean} если true то было смещение
          * @private
          */
         _isDrag: function(e) {
            var
               moveX = e.pageX - this._moveBeginX,
               moveY = e.pageY - this._moveBeginY;

            if ((Math.abs(moveX) < this._constShiftLimit) && (Math.abs(moveY) < this._constShiftLimit)) {
               return false;
            }
            return true;
         },
         /**
          * Конец перетаскивания
          * @param {Event} e js событие
          * @param {Boolean} droppable Закончили над droppable контейнером
          * @private
          */
         _endDrag: function (e, droppable) {
            DragObject.onDragHandler(e);
            //После опускания мыши, ещё раз позовём обработку перемещения, т.к. в момент перед отпусканием мог произойти
            //переход границы между сменой порядкового номера и перемещением в папку, а обработчик перемещения не вызваться,
            //т.к. он срабатывают так часто, насколько это позволяет внутренняя система взаимодействия с мышью браузера.
            if (droppable) { //запускаем только если сработало внутри droppable контейнера, иначе таргета нет и нечего обновлять
               this._updateDragTarget(DragObject, e);
            }
            var res = this._notify('onDragEnd', DragObject, e);
            if (res !== false) {
               this._endDragHandler(DragObject, droppable, e);
            }

            DragObject.reset();
            this._position = null;
            DragObject.setDragging(false);
            $('body').removeClass('dragdropBody cantDragDrop ws-unSelectable');
         },
         //endregion protected
         //region mouseHandler
         /**
          *
          * @param e
          */
         onMouseupInside: function (e) {
            this._mouseUp(e, true);
         },

         onMouseupOutside: function(buse, e) {
            this._mouseUp(e, false);
         },

         _mouseUp: function(e, inside){
            if (DragObject.isDragging() && (
               DragObject.getTargetsControl() === this ||
               !DragObject.getTargetsControl() && DragObject.getOwner() === this)
            ){ //если есть таргет то запускаем _endDrag над таргетом иначе запускаем над тем кто начал
               this._endDrag(e, inside ? this._findDragDropContainer(e, e.target) : false);
            }
            this._moveBeginX = null;
            this._moveBeginY = null;
         },
         /**
          * обработчик  соь
          * @param buse
          * @param e
          * @returns {boolean}
          */
         onMousemove: function (buse, e) {
            // Если нет выделенных компонентов, то уходим
            if (!DragObject.isDragging()) {
               return;
            }
            DragObject.onDragHandler(e);

            //если этот контрол начал перемещение или тащат над ним тогда стреяем событием _onDrag
            if (DragObject.getOwner() === this || DragObject.getTargetsControl() === this ) {
               var
                  //определяем droppable контейнер
                  movable = this._findDragDropContainer(e, e.target);
               //двигаем компонент
               this._onDrag(e, movable);
               return false;
            }
         }

         //endregion mouseHandler
      };

   return DragAndDropMixin;
});