/**
 * Created by iv.cheremushkin on 23.01.2015.
 */
define('js!SBIS3.CONTROLS.MenuButtonMixin', ['js!SBIS3.CONTROLS.ContextMenu'], function(ContextMenu) {
   /**
    * Миксин, добавляющий поведение хранения одного или нескольких выбранных элементов
    * @mixin SBIS3.CONTROLS.MenuButtonMixin
    * @public
    */
   'use strict';

   var MenuButtonMixin = /**@lends SBIS3.CONTROLS.MenuButtonMixin.prototype  */{
      $protected: {
         _options: {
         }
      },

      $constructor: function () {
         this._publish('onMenuItemActivate');
      },

      _createPicker: function(targetElement){
         return new ContextMenu({
            parent: this.getParent(),
            context: this.getParent() ? this.getParent().getLinkedContext() : {},
            element: targetElement,
            target : this.getContainer(),
            items: this._items,
            corner : 'bl',
            hierField: this._options.hierField,
            keyField: this._options.keyField,
            verticalAlign: {
               side: 'top'
            },
            horizontalAlign: {
               side: 'left'
            },
            closeByExternalClick: true,
            targetPart: true
         });
      },

      after : {
         _initializePicker : function() {
            var self = this;
            this._picker.subscribe('onMenuItemActivate', function(e, id) {
               self._notify('onMenuItemActivate', id)
            })
         }
      },

      _drawItems : function() {
         var self = this;
         if (this._picker) {
            this._picker.destroy();
         }
         this._initializePicker();
         this._initMenu();
      }
   };

   return MenuButtonMixin;
});

