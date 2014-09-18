define('js!SBIS3.CONTROLS._PickerMixin', ['js!SBIS3.CONTROLS.FloatArea'], function(FloatArea) {
   /**
    * Контрол умеющий отображать выдающий вниз блок, в котором можно что-то выбрать
    * Задается контент (протектед методом каким-то) и методы которые позволяют открывать, закрывать блок.
    * @mixin SBIS3.CONTROLS._PickerMixin
    */
   var _PickerMixin = /** @lends SBIS3.CONTROLS._PickerMixin.prototype */{
      $protected: {
         _picker : null,
         _options: {

         }
      },

      $constructor: function() {
         var
            self = this,
            container = this._container,
            pickerContainer = $('<div></div>');
         // чтобы не нарушать выравнивание по базовой линии
         $('body').append(pickerContainer);

         this._picker = new FloatArea({
            element : pickerContainer,
            target : container
         });

         /*TODO это как то получше надо переписать*/
         $('body *').mousedown(function(e){
            var inCombobox = self._container.find($(e.target));
            var inPicker = self._picker.getContainer().find($(e.target));
            if (!inCombobox.length && !inPicker.length) {
               self.hidePicker();
            }
         });
      },
      /**
       * Показывает выпадающий блок
       */
      showPicker: function() {
         this._picker._container.css('visibility','hidden');
         this._picker.show();
         this._picker.recalcPosition();
         this._picker._container.css('visibility','visible');
      },
      /**
       * Скрывает выпадающий блок
       */
      hidePicker: function() {
         this._picker.hide();
      },

      togglePicker: function() {
         this._picker._container.css('visibility','hidden');
         this._picker.toggle();
         this._picker.recalcPosition();
         this._picker._container.css('visibility','visible');
      }

   };

   return _PickerMixin;

});