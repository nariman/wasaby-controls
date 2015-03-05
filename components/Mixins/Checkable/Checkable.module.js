define('js!SBIS3.CONTROLS.Checkable', [], function() {

   /**
    * Миксин, добавляющий поведение хранения выбранного элемента. Всегда только одного
    * @mixin SBIS3.CONTROLS.Checkable
    */

   var Checkable = /**@lends SBIS3.CONTROLS.Checkable.prototype  */{
      $protected: {
         _options: {
            /**
             * @cfg {Boolean} Признак активности кнопки в начальном состоянии
             * Возмозможные значения:
             * <ul>
             *    <li>true - кнопка нажата/ чекбокс с галочкой/ радиокнопка выбрана;</li>
             *    <li>false - кнопка не нажата/ чекбокс пустой/ радиокнопка пустая.</li>
             * </ul>
             * @example
             * <pre>
             *     <option name="checked">true</option>
             * </pre>
             * @see setChecked
             */
            checked: false
         }
      },

      $constructor: function() {
         this._publish('onCheckedChange');
      },

      /**
       * Устанавливает состояние кнопки.
       * @param {Boolean} flag Признак состояния кнопки true/false.
       * @example
       * <pre>
       *     var btn = this.getChildControlByName(("myButton");
       *        btn.setChecked(true);
       * </pre>
       * @see checked
       * @see isChecked
       * @see setValue
       */
      setChecked: function(flag) {
         this._options.checked = !!flag;
         this._container.toggleClass('controls-Checked__checked', this._options.checked);
         this.saveToContext('Checked', this._options.checked);
         this._notify('onCheckedChange', this._options.checked);
      },

      /**
       * Признак текущего состояния кнопки.
       * Возможные значения:
       * <ul>
       *    <li>true - кнопка нажата/ чекбокс с галочкой/ радиокнопка выбрана;</li>
       *    <li>false - кнопка не нажата/ чекбокс пустой/ радиокнопка пустая.</li>
       * </ul>
       * @see checked
       * @see setChecked
       * @see getValue
       */
      isChecked: function() {
         return this._options.checked;
      },

      /**
       * Изменить текущее состояние кнопки.
       * @param {Boolean} value Новое состояние.
       * @example
       * <pre>
       *     var btn = this.getChildControlByName("myButton");
       *        btn.setValue(true)
       * </pre>
       * @see setChecked
       * @see getValue
       * @see isChecked
       */
      setValue: function(value){
         this.setChecked(value);
      },

      /**
       * Возвращает текущее состояние кнопки.
       * @returns {Boolean} Признак текущего состояния кнопки: true/false.
       * @example
       * <pre>
       *     var btn = this.getChildControlByName("myButton");
       *        btn.getValue();
       * </pre>
       * @see isChecked
       * @see checked
       * @see setChecked
       * @see setValue
       */
      getValue: function(){
         return this.isChecked();
      },

      _clickHandler : function() {
         this.setChecked(!(this.isChecked()));
      }
   };

   return Checkable;

});/**
 * Created by kraynovdo on 27.10.2014.
 */
