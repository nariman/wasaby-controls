define('Controls-demo/Date/MonthListSource', [
   'Core/Deferred',
   'Types/source',
   'Types/formatter',
   'Controls/Utils/Date'
], function(Deferred, source, formatter, dateUtils) {
   'use strict';

   var CalendarSource = source.Memory.extend({
      _moduleName: 'ControlsDemo.Date.MonthListSource',
      $protected: {
         _dataSetItemsProperty: 'items',
         _dataSetTotalProperty: 'total'
      },

      _$idProperty: 'id',

      // call: function(methodName, params) {
      //    var def = new Deferred()
      // },

      query: function(query) {
         var
            offset = query.getOffset(),
            where = query.getWhere(),
            limit = query.getLimit() || 1,
            executor;

         executor = (function() {
            var adapter = this.getAdapter().forTable(),
               items = [],
               monthEqual = where['id~'],
               monthGt = where['id>='],
               monthLt = where['id<='],
               month = monthEqual || monthGt || monthLt,
               extData,
               daysInMonth,
               deferred = new Deferred();

            if (month) {
               month = formatter.dateFromSql(month);
            } else {
               month = dateUtils.getStartOfMonth(new Date());
            }

            month.setMonth(month.getMonth() + offset);

            if (monthLt) {
               month.setMonth(month.getMonth() - limit);
            } else if (monthGt) {
               month.setMonth(month.getMonth() + 1);
            }

            for (var i = 0; i < limit; i++) {
               extData = [];
               daysInMonth = dateUtils.getDaysInMonth(month);
               for (var d = 0; d < daysInMonth; d++) {
                  extData.push({ isEven: d % 2 });
               }
               items.push({
                  id: formatter.dateToSql(month, formatter.TO_SQL_MODE.DATE),
                  extData: extData
               });
               month.setMonth(month.getMonth() + 1);
            }

            this._each(
               items,
               function(item) {
                  adapter.add(item);
               }
            );
            items = this._prepareQueryResult({
               items: adapter.getData(),
               total: monthEqual ? { before: true, after: true } : true
            });

            setTimeout(function() {
               deferred.callback(items);
            }, 1000);

            return deferred;
         }).bind(this);

         if (this._loadAdditionalDependencies) {
            return this._loadAdditionalDependencies().addCallback(executor);
         } else {
            return Deferred.success(executor());
         }
      }
   });

   return CalendarSource;
});
