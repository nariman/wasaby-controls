/**
 * Created by am.gerasimov on 19.10.2015.
 */

define('js!SBIS3.CONTROLS.SelectorMixin', [],
   function () {

      'use strict';

      /**
       * Описание логики выбора из диалога/панели.
       * SelectorMixin используется полем связи.
       * @mixin
       * @public
       * @author Крайнов Дмитрий Олегович
       */
      var SelectorMixin = /**@lends SBIS3.CONTROLS.SelectorMixin.prototype  */{
         $protected: {
            _linkedView: null,
            _selectionConfirmHandler: undefined,
            _dRender: null,
            _options: {
               /**
                * @cfg {Boolean} Устанавливает режим множественного выбора элементов коллекции.
                * Подробно режим множественного выбора описан {@link SBIS3.CONTROLS.MultiSelectable#multiselect здесь}.
                * @variant true Режим множественного выбора элементов коллекции установлен.
                * @variant false Режим множественного выбора элементов коллекции отменен.
                * @example
                * <pre>
                *     <option name="multiSelect">true</option>
                * </pre>
                */
               multiSelect: false,
               /**
                * cfg {Array} Определяет массив первичных ключей выбранных элементов коллекции.
                * @remark
                * Устанавливает массив идентификаторов выбранных элементов коллекции, которые будут по умолчанию выбраны
                * для контрола, который находится в режиме множественного выбора значений {@link SBIS3.CONTROLS.MultiSelectable#multiselect}.
                * Для задания выбранных элементов необходимо указать значения
                * {@link SBIS3.CONTROLS.DSMixin#keyField ключевого поля} элементов коллекции.
                * @example
                */
               currentSelectedKeys: [],
               /**
                * Обработчик на закрытие диалога/всплывающей панели
                */
               closeCallback: undefined
            }
         },
         $constructor: function () {
            var self = this;

            /* Подпишемся на готовность диалога/всплывающей панели */
            if (!(self._dRender instanceof $ws.proto.Deferred)) {
               self._dRender = new $ws.proto.Deferred();
               self.subscribe('onAfterLoad', function () {
                  self._dRender.callback();
               });
            }

            this._changeSelectionHandler = function (event, result) {
               if(!self._options.multiSelect) {
                  self.close([result.item]);
               }
            };

            this._dRender.addCallback(function(){
               var childControls = self.getChildControls();

               for(var i = 0, l = childControls.length; i < l; i++){
                  var childControl = childControls[i];

                  if($ws.helpers.instanceOfModule(childControl, 'SBIS3.CONTROLS.ListView')){
                     self.setLinkedView(childControl);
                     break;
                  }
               }
            });
         },

         _toggleLinkedViewEvents: function(sub) {
            this._options.multiSelect ?
               this[sub ? 'subscribeOnceTo' : 'unsubscribeFrom'](this._linkedView, 'onDrawItems', this._linkedView.setSelectedKeys.bind(this._linkedView, this._options.currentSelectedKeys)) :
               this[sub ? 'subscribeTo' : 'unsubscribeFrom'](this._linkedView, 'onItemActivate', this._changeSelectionHandler);
         },

         setLinkedView: function (linkedView) {
            this._linkedView && this._toggleLinkedViewEvents(false);
            this._linkedView = linkedView;

            if (linkedView) {
               this._linkedView.setProperty('multiselect', this._options.multiSelect);
               this._linkedView.setSelectedKeys(this._options.currentSelectedKeys);
               this._toggleLinkedViewEvents(true);
               this._linkedView.reload();
            }
         },

         /**
          * Получить связное представление данных для этого диалога выбора
          * @returns {SBIS3.CONTROLS.ListView}
          */
         getLinkedView: function () {
            return this._linkedView;
         },

         before: {
            close: function (value) {
               if (typeof this._options.closeCallback === 'function') {
                  this._options.closeCallback(value);
               }
            }
         }
      };

      return SelectorMixin;

   });
