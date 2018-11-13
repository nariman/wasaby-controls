define('Controls/Decorator/Money',
   [
      'Core/IoC',
      'Core/Control',
      'WS.Data/Type/descriptor',
      'Controls/Utils/splitIntoTriads',
      'wml!Controls/Decorator/Money/Money',

      'css!Controls/Decorator/Money/Money'
   ],
   function(IoC, Control, descriptor, splitIntoTriads, template) {

      'use strict';

      /**
       * Converts a number to money.
       *
       * @class Controls/Decorator/Money
       * @extends Core/Control
       * @control
       * @public
       * @category Decorator
       *
       * @author Журавлев Максим Сергеевич
       */

      /**
       * @name Controls/Decorator/Money#number
       * @cfg {Number} Number to convert.
       */

      /**
       * @name Controls/Decorator/Money#style
       * @cfg {String} The type with which you want to display money.
       * @variant accentResults
       * @variant noAccentResults
       * @variant group
       * @variant basicRegistry
       * @variant noBasicRegistry
       * @variant accentRegistry
       * @variant noAccentRegistry
       * @variant error
       */

      var _private = {
         searchPaths: /([0-9]*?)(\.[0-9]{2})/,

         parseNumber: function(number) {
            var exec = this.searchPaths.exec(number.toFixed(2));

            if (!exec) {
               IoC.resolve('ILogger').error('Controls/Decorator/Money', 'That is not a valid option number: ' + number + '.');
               exec = ['0.00', '0', '.00'];
            }

            var integer = splitIntoTriads(exec[1]);
            var fraction = exec[2];

            return {
               integer: integer,
               fraction: fraction,
               number: integer + fraction
            };
         }
      };

      var Money = Control.extend({
         _template: template,

         _parsedNumber: null,

         _beforeMount: function(options) {
            this._parsedNumber = _private.parseNumber(options.number);
         },

         _beforeUpdate: function(newOptions) {
            if (newOptions.number !== this._options.number) {
               this._parsedNumber = _private.parseNumber(newOptions.number);
            }
         }
      });

      Money.getOptionTypes = function() {
         return {
            number: descriptor(Number).required()
         };
      };

      Money._private = _private;

      return Money;
   }
);
