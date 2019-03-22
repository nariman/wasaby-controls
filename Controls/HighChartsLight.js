define('Controls/HighChartsLight',
   [
      'Core/Control',
      'wml!Controls/HighChartsLight/HighChartsLight',
      'Env/Env',
      'Core/core-clone',
      'browser!/cdn/Highcharts/7.0.3/highcharts.js',
      'browser!/cdn/Highcharts/7.0.3/highcharts-more.js',
      'Core/Date',
      'css!theme?Controls/HighChartsLight/HighChartsLight',
      'i18n!Controls/HighChartsLight'
   ],
   function(Control, template, Env, cClone, Highcharts, More) {
      'use strict';

      /**
       * Component HighChartsLight
       * @class Controls/HighChartsLight
       * @extends Core/Control
       * @mixes Controls/interface/IHighCharts
       * @control
       * @public
       * @author Волоцкой В.Д.
       * @demo Controls-demo/HighChartsLight/HighChartsLight
       */

      var _private = {
            drawChart: function(self, config) {
               var tempConfig = cClone(config);
               tempConfig.chart.renderTo = self._children.chartContainer;
               tempConfig.credits = config.credits || {};
               tempConfig.credits.enabled = false;
               if (self._chartInstance) {
                  self._chartInstance.destroy();
               }
               self._chartInstance = new Highcharts.Chart(tempConfig);
            },
            patchHighchartsJs: function() {
               if (Highcharts && !Highcharts._isPatched) {
                  var originalIsObject = Highcharts.isObject;

                  Highcharts._isPatched = true;

                  /*
                     Highcharts in IE 10 fails because it exceeds stack size
                     limit while cloning the config that contains WS Data
                     objects: Models, Maps, ...

                     Highcharts uses its own `isObject` function to see if it
                     should deep clone an object or copy the reference.
                     We replace this isObject function in IE 10 so it would not
                     deep clone WS Data objects.
                  */
                  Highcharts.isObject = function(obj, strict) {
                     var isWSObject = obj && obj._moduleName;
                     return !isWSObject && originalIsObject(obj, strict);
                  };
               }
            }
         },
         HighChart = Control.extend({
            _template: template,
            _chartInstance: null,

            _beforeMount: function() {
               if (typeof window !== 'undefined' && Env.detection.isIE10) {
                  _private.patchHighchartsJs();
               }
            },

            _shouldUpdate: function() {
               return false;
            },

            _afterMount: function(config) {
               this._notify('register', ['controlResize', this, this._reflow], {bubbling: true});
               More(Highcharts);
               Highcharts.setOptions({
                  lang: {
                     numericSymbols: ['', '', '', '', '', ''],
                     months: Env.constants.Date.longMonths,
                     shortMonths: Env.constants.Date.months,
                     weekdays: Env.constants.Date.longDays,
                     thousandsSep: ' ',
                     resetZoom: rk('Сбросить масштабирование'),
                     resetZoomTitle: rk('Сбросить масштабирование')
                  },
                  plotOptions: {
                     series: {
                        animation: !Env.detection.isIE10
                     }
                  }
               });
               _private.drawChart(this, config.chartOptions);
            },

            _beforeUpdate: function(config) {
               if (this._options.chartOptions !== config.chartOptions) {
                  _private.drawChart(this, config.chartOptions);
               }
            },



            _beforeUnmount: function() {
               this._notify('unregister', ['controlResize', this], {bubbling: true});
               this._chartInstance.destroy();
               this._chartInstance = undefined;
            },

            _reflow: function() {
               this._chartInstance.reflow();
            }
         });

      return HighChart;
   });
