/**
 * Поле контекста в котором лежит фильтр раскладки.
 * А так же item'ы для быстрого фильтра и кнопки фильтров.
 * @author Герасимов Александр
 * @class Controls/Layout/Filter/FilterContextField
 */
define('Controls/Layout/Filter/FilterContextField', ['Core/DataContext'], function(DataContext) {
      'use strict';
      
      return DataContext.extend({
         filter: null,
         filterButtonItems: null,
         fastFilterItems: null,
         
         constructor: function(cfg) {
            this.filter = cfg.filter;
            this.filterButtonItems = cfg.filterButtonItems;
            this.fastFilterItems = cfg.fastFilterItems;
         }
      });
   }
);