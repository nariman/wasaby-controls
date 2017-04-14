define('js!SBIS3.CONTROLS.DateRangeSliderBase',[
   'js!SBIS3.CORE.CompoundControl',
   'tmpl!SBIS3.CONTROLS.DateRangeSliderBase',
   'tmpl!SBIS3.CONTROLS.DateRangeSliderBase/resources/LockIcon',
   'js!SBIS3.CONTROLS.RangeMixin',
   'js!SBIS3.CONTROLS.DateRangeMixin',
   'js!SBIS3.CONTROLS.PickerMixin',
   'js!SBIS3.CONTROLS.FormWidgetMixin',
   'Core/helpers/date-helpers',
   'js!SBIS3.CONTROLS.Link',
   'css!SBIS3.CONTROLS.DateRangeSliderBase'
], function (CompoundControl, dotTplFn, lockIconTemplate, RangeMixin, DateRangeMixin, PickerMixin, FormWidgetMixin, dateHelpers) {
   'use strict';

   /**
    * Базовый класс для контролов выглядящих как ссыслка с возможностью листать периоды в большую и меньшую сторону.
    *
    * SBIS3.CONTROLS.DateRangeSliderBase
    * @class SBIS3.CONTROLS.DateRangeSliderBase
    * @extends SBIS3.CORE.CompoundControl
    * @mixes SBIS3.CONTROLS.PickerMixin
    * @mixes SBIS3.CONTROLS.RangeMixin
    * @mixes SBIS3.CONTROLS.DateRangeMixin
    * @mixes SBIS3.CONTROLS.FormWidgetMixin
    * @author Миронов Александр Юрьевич
    *
    * @control
    * @public
    * @category Date/Time
    */
   var DateRangeSlider = CompoundControl.extend([PickerMixin, RangeMixin, DateRangeMixin, FormWidgetMixin], /** @lends SBIS3.CONTROLS.DateRangeSliderBase.prototype */{
      _dotTplFn: dotTplFn,
      $protected: {
         _options: {
            lockIconTemplate: lockIconTemplate,
            // year: null,
            /**
             * @cfg {String} тип комопонента
             * normal - стандартный вид
             * link - в виде ссылки
             */
            type: 'normal',

            /**
             * @cfg {Boolean} отобразить управляющую стрелку для переключения на следующий период
             */
            showNextArrow: true,
            /**
             * @cfg {Boolean} отобразить управляющую стрелку для переключения на предыдущий период
             */
            showPrevArrow: true,

            /**
             * @cfg {Boolean} включает или отключает отображение замка.
             */
            showLock: false,

            locked: true
         },
         _cssRangeSlider: {
            value: 'controls-DateRangeSlider__value',
            yearState: 'controls-DateRangeSlider__yearState'
         }
      },

      init: function () {
         var container = this.getContainer();

         DateRangeSlider.superclass.init.call(this);

         if (this._options.type === 'normal') {
            container.find(['.', this._cssRangeSlider.value].join('')).click(this.showPicker.bind(this));
         } else {
            this.getChildControlByName('Link').subscribe('onActivated', this.showPicker.bind(this));
         }

         container.find('.controls-DateRangeSlider__prev').click(this._onPrevBtnClick.bind(this));
         container.find('.controls-DateRangeSlider__next').click(this._onNextBtnClick.bind(this));

         this.subscribe('onRangeChange', this._updateValueView.bind(this));
      },

      _modifyOptions: function() {
         var opts = DateRangeSlider.superclass._modifyOptions.apply(this, arguments);
         opts._caption = this._getCaption(opts);
         return opts;
      },

      _onPrevBtnClick: function () {
         if (this.isEnabled()) {
            this.setPrev();
            this._updateValueView();
         }
      },

      _onNextBtnClick: function () {
         if (this.isEnabled()) {
            this.setNext();
            this._updateValueView();
         }
      },

      _updateValueView: function () {
         var caption = this._getCaption();
         if (this._options.type === 'normal') {
            this.getContainer().find(['.', this._cssRangeSlider.value].join('')).text(caption);
         } else {
            this.getChildControlByName('Link').setCaption(caption);
         }

      },

      _getCaption: function (opts) {
         opts = opts || this._options;
         // В качестве пустого значения используем неразрывный пробел @nbsp;('\xA0') что бы не ехала верстка
         return dateHelpers.getFormattedDateRange(
            opts.startValue,
            opts.endValue,
            {
               contractToMonth: true,
               fullNameOfMonth: true,
               contractToQuarter: true,
               contractToHalfYear: true,
               emptyPeriodTitle: opts.showUndefined ? rk('Период не указан') : '\xA0'
            }
         );
      },

      _onClickHandler: function(event) {
         var target = $(event.target);
         DateRangeSlider.superclass._onClickHandler.apply(this, arguments);
         if (this.isEnabled()) {
            if (target.hasClass('controls-DateRangeSlider__lock')) {
               this._onLockBtnClick();
            }
         }
      },

      _onLockBtnClick: function () {
         this.toggleLocked();
      },

      isLocked: function () {
         return this._options.locked;
      },
      setLocked: function (value) {
         var btnContainer;
         if (value === this._options.locked) {
            return;
         }
         this._options.locked = value;
         if (this.isShowLock()) {
            btnContainer = this.getContainer().find('.controls-DateRangeSlider__lock');
            this._updateLockButtonClasses(btnContainer);
            this._notify('onLockedChanged', value);
         }
      },
      toggleLocked: function () {
         this.setLocked(!this.isLocked());
      },

      isShowLock: function () {
         return this._options.showLock;
      },
      setShowLock: function (value) {
         var btnContainer;
         if (value === this._options.showLock) {
            return;
         }
         this._options.showLock = value;
         if (value) {
            btnContainer = $(this._options.lockIconTemplate(this._options));
            this.getContainer().find('.controls-DateRangeSlider__value-wrapper').prepend(btnContainer);
         } else {
            this.getContainer().find('.controls-DateRangeSlider__lock').remove();
         }
      },

      _updateLockButtonClasses: function (btnContainer) {
         if (this.isLocked()) {
            btnContainer.removeClass('icon-Unlock icon-disabled');
            btnContainer.addClass('controls-DateRangeSlider__lock-locked icon-Lock icon-primary');
         } else {
            btnContainer.removeClass('.controls-DateRangeSlider__lock-locked icon-Lock icon-primary');
            btnContainer.addClass('icon-Unlock icon-disabled');
         }
      }
   });

   return DateRangeSlider;
});
