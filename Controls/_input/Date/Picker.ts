import {detection} from 'Env/Env';
import Control = require('Core/Control');
import coreMerge = require('Core/core-merge');
import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');
import IDateTimeMask = require('Controls/interface/IDateTimeMask');
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_input/Date/Picker/Picker');
import 'css!theme?Controls/input';

   /**
    * Control for entering date. Also, the control allows you to select a date with the mouse using the drop-down box.
    * <a href="/materials/demo-ws4-input-datepicker">Demo examples.</a>.
    *
    * @class Controls/_input/Date/Picker
    * @extends Core/Control
    * @mixes Controls/interface/IInputDateTime
    * @mixes Controls/interface/IDateMask
    * @mixes Controls/interface/IInputTag
    * @mixes Controls/interface/IInputBase
    * @mixes Controls/interface/IInputPlaceholder
    *
    * @css @spacing_DatePicker-between-input-button Spacing between input field and button.
    *
    * @control
    * @public
    * @demo Controls-demo/Input/Date/PickerPG
    * @category Input
    * @author Миронов А.Ю.
    */

   var Component = Control.extend([], {
      _template: template,
      _proxyEvent: tmplNotify,

      // _beforeMount: function(options) {
      // },
      //
      // _beforeUpdate: function(options) {
      // },
      //
      // _beforeUnmount: function() {
      // },

      _openDialog: function(event) {
          var cfg = {
            opener: this,
            target: this._container,
            template: 'Controls/Date/PeriodDialog',
            className: 'controls-PeriodDialog__picker-withoutModeBtn',
            horizontalAlign: { side: 'right' },
            corner: { horizontal: 'left' },
            eventHandlers: {
               onResult: this._onResult.bind(this)
            },
            templateOptions: {
               startValue: this._options.value,
               endValue: this._options.value,
               mask: this._options.mask,
               selectionType: 'single',
               headerType: 'input',
               closeButtonEnabled: true
            }
         };
         if (!this._options.vdomDialog || (detection.isIE && detection.IEVersion < 13)) {
            cfg.template = 'SBIS3.CONTROLS/Date/RangeBigChoose';
            cfg.isCompoundTemplate = true;
            cfg.templateOptions.handlers = { onChoose: this._onResultWS3.bind(this) };
         }
         this._children.opener.open(cfg);
      },

      _onResultWS3: function(event, startValue) {
         this._onResult(startValue);
      },

      _onResult: function(startValue) {
         var
            stringValueConverter = new StringValueConverter({
               mask: this._options.mask,
               replacer: this._options.replacer
            }),
            textValue = stringValueConverter.getStringByValue(startValue);
         this._notify('valueChanged', [startValue, textValue]);
         this._children.opener.close();
         this._notify('inputCompleted', [startValue, textValue]);
      },
   });

   Component.getDefaultOptions = function() {
      return coreMerge({}, IDateTimeMask.getDefaultOptions());
   };

   Component.getOptionTypes = function() {
      return coreMerge({}, IDateTimeMask.getOptionTypes());
   };

   export = Component;


