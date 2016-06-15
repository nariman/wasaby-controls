/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Adapter.RecordSetRecord', [
   'js!SBIS3.CONTROLS.Data.Entity.Abstract',
   'js!SBIS3.CONTROLS.Data.Adapter.IRecord',
   'js!SBIS3.CONTROLS.Data.Adapter.GenericFormatMixin',
   'js!SBIS3.CONTROLS.Data.Record',
   'js!SBIS3.CONTROLS.Data.Utils'
], function (Abstract, IRecord, GenericFormatMixin, Record, Utils) {
   'use strict';

   /**
    * Адаптер для записи таблицы данных в формате записи
    * @class SBIS3.CONTROLS.Data.Adapter.RecordSetRecord
    * @extends SBIS3.CONTROLS.Data.Entity.Abstract
    * @mixes SBIS3.CONTROLS.Data.Adapter.IRecord
    * @mixes SBIS3.CONTROLS.Data.Adapter.GenericFormatMixin
    * @public
    * @author Мальцев Алексей
    */

   var RecordSetRecord = Abstract.extend([IRecord, GenericFormatMixin], /** @lends SBIS3.CONTROLS.Data.Adapter.RecordSetRecord.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Adapter.RecordSetRecord',

      /**
       * @member {SBIS3.CONTROLS.Data.Record} Запись
       */
      _data: null,

      /**
       * Конструктор
       * @param {*} data Сырые данные
       */
      constructor: function (data) {
         if (!data) {
            data = new Record();
         }
         if (!$ws.helpers.instanceOfModule(data, 'SBIS3.CONTROLS.Data.Record')) {
            throw new TypeError('Argument data should be an instance of SBIS3.CONTROLS.Data.Record');
         }
         RecordSetRecord.superclass.constructor.call(this, data);
         GenericFormatMixin.constructor.call(this, data);
      },

      //region SBIS3.CONTROLS.Data.Adapter.IRecord

      has: function (name) {
         return this._data.has(name);
      },

      get: function (name) {
         return this._data.get(name);
      },

      set: function (name, value) {
         if (!name) {
            throw new ReferenceError(this._moduleName + '::set(): field name is not defined');
         }
         return this._data.set(name, value);
      },

      clear: function () {
         var fields = [];
         this._data.each(function(field) {
            fields.push(field);
         });
         for (var i = 0; i < fields.length; i++) {
            this._data.removeField(fields[i]);
         }
      },

      getEmpty: function () {
         Utils.logger.stack(this._moduleName + '::getEmpty(): method is deprecated and will be removed in 3.7.4. Use clear() instead.');
         var record = this._data.clone();
         record.setRawData(null);
         return record;
      },

      getFields: function () {
         var fields = [];
         this._data.each(function(name) {
            fields.push(name);
         });
         return fields;
      },

      addField: function(format, at) {
         this._data.addField(format, at);
      },

      removeField: function(name) {
         this._data.removeField(name);
      },

      removeFieldAt: function(index) {
         this._data.removeFieldAt(index);
      },

      //endregion SBIS3.CONTROLS.Data.Adapter.IRecord

      //region Protected methods

      _getFieldsFormat: function() {
         return this._data.getFormat();
      }

      //endregion Protected methods
   });

   return RecordSetRecord;
});
