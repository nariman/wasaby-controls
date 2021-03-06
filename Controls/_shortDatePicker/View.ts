import rk = require('i18n!Controls');
import BaseControl = require('Core/Control');
import coreMerge = require('Core/core-merge');
import {Date as WSDate} from 'Types/entity';
import getCurrentPeriod = require('Core/helpers/Date/getCurrentPeriod');
import IPeriodSimpleDialog from './IDateLitePopup';
import dateUtils = require('Controls/Utils/Date');
import componentTmpl = require('wml!Controls/_shortDatePicker/DateLitePopup');
import listTmpl = require('wml!Controls/_shortDatePicker/List');
import ItemWrapper = require('wml!Controls/_shortDatePicker/ItemWrapper');
import 'css!theme?Controls/shortDatePicker';
import {date as formatDate} from 'Types/formatter';
import monthTmpl = require('wml!Controls/_shortDatePicker/monthTemplate');
import {Logger} from 'UI/Utils';

/**
 * Контрол выбора даты или периода.
 *
 * @class Controls/shortDatePicker
 * @extends Core/Control
 * @mixes Controls/shortDatePicker/IDateLitePopup
 * @mixes Controls/_interface/IDisplayedRanges
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ShortDatePicker/Index
 * @demo Controls-demo/ShortDatePicker/Source/Index
 * @demo Controls-demo/ShortDatePicker/DisplayedRanges/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/ContentTemplate/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/Index
 */

/*
 * Control for date or period selection.
 *
 * @class Controls/shortDatePicker
 * @extends Core/Control
 * @mixes Controls/shortDatePicker/IDateLitePopup
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/ShortDatePicker/Index
 * @demo Controls-demo/ShortDatePicker/Source/Index
 * @demo Controls-demo/ShortDatePicker/DisplayedRanges/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/ContentTemplate/Index
 * @demo Controls-demo/ShortDatePicker/MonthTemplate/IconTemplate/Index
 *
 */

var _private = {

    _getYearListPosition: function (options, dateConstructor) {

        let start = options.startValue,
            currentDate = new dateConstructor(),
            startValueYear = start ? start.getFullYear() : null;

        if (!startValueYear) {
            return currentDate;
        }

        if (startValueYear >= currentDate.getFullYear()) {
            return start;
        } else if (currentDate.getFullYear() - startValueYear >= 5) {
            return new dateConstructor(startValueYear + 4, 0);
        } else {
            return currentDate;
        }
    }
};
//В режиме 'Только года' одновременно отобржается 5 элементов.
//Таким образом последний отображаемый элемент имеет индекс 4.
const ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX = 4;

var Component = BaseControl.extend({
    _template: componentTmpl,
    _defaultListTemplate: listTmpl,
    monthTemplate: null,

    _position: null,

    _yearHovered: null,

    _range: null,

    // constructor: function() {
    //    this._dayFormatter = this._dayFormatter.bind(this);
    //    Component.superclass.constructor.apply(this, arguments);
    // },

    _beforeMount: function (options) {

        this._emptyCaption = options.emptyCaption;
        if (!this._emptyCaption) {
            if (options.chooseMonths && (options.chooseQuarters || options.chooseHalfyears)) {
                this._emptyCaption = rk('Период не указан');
            } else {
                this._emptyCaption = rk('Не указан');
            }
        }

        this._caption = options.captionFormatter(options.startValue, options.endValue, options.emptyCaption);

        if (!(options.chooseQuarters && options.chooseMonths) && options.chooseHalfyears) {
            Logger.error(
                'shortDatePicker: Unsupported combination of chooseQuarters, chooseMonths and chooseHalfyears options',
                this);
        }

        if (options.chooseQuarters || options.chooseMonths || options.chooseHalfyears) {
            this._position = options.year || options.startValue || (new options.dateConstructor());
        } else {
            this._position = _private._getYearListPosition(options, options.dateConstructor);
        }
        if (options.range) {
            Logger.error('shortDatePicker: ' + rk('You should use displayedRanges option instead of range option.'), this);
        }
        this._displayedRanges = options.displayedRanges || options.range;

        this.monthTemplate = options.monthTemplate || monthTmpl;
    },

    _beforeUpdate: function (options) {
        // this._caption = _private._getCaption(options);
    },

    /**
     * Sets the current year
     * @param year
     */
    setYear: function (year) {
        this._position = new this._options.dateConstructor(year, 0, 1);
        this._notify('yearChanged', [year]);
    },

    _dateToDataString(date) {
        return formatDate(date, 'YYYY-MM-DD');
    },

    _onYearMouseEnter: function (event, year) {
        if (this._options.chooseYears) {
            this._yearHovered = year;
        }
    },

    _hitsDiplayedRange: function (year, index) {
        const date = new Date(year, 0);
        //Проверяем второй элемент массива на null. Если задан null в опции displayedRanges
        //то лента будет отображаться бесконечно.
        return this._displayedRanges[index][0] <= date &&
            (this._displayedRanges[index][1] === null || this._displayedRanges[index][1] >= date);
    },

    _getDisplayedYear: function (year, delta) {
        if (!this._displayedRanges) {
            return year + delta;
        }
        let index;
        //Ищем массив в котором находится year.
        for (let i = 0; i < this._displayedRanges.length; i++) {
            if (this._hitsDiplayedRange(year, i)) {
                index = i;
                break;
            }
        }
        //Проверяем год, на который переходим. Если оне не попадает в тот же массив что и year - ищем ближайших год на
        //который можно перейти в следующем массиве
        if (this._hitsDiplayedRange(year + delta, index)) {
            return year + delta;
        } else {
            if (this._displayedRanges[index + delta]) {
                if (delta === 1) {
                    return this._displayedRanges[index + delta][0].getFullYear();
                } else {
                    return this._displayedRanges[index + delta][1].getFullYear();
                }
            }
        }
        return year;
    },

    _changeYear : function(event, delta) {
        let year = this._position.getFullYear();
        //_position определяется первым отображаемым годом в списке. Всего у нас отображается
        //5 записей. Для перехода на предыдущий элемент, нужно проверить, возможно ли это.
        //Для этого проверям самый нижний элемент списка.
        if (delta === -1 && !this._options.chooseMonths &&
            !this._options.chooseHalfyears && !this._options.chooseQuarters) {
            //Нижний отображаемый год в списке из 5 элементов.
            const yearToCheck = year - ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX;
            //_getDisplayedYear вернет нижний отображаемый год. Нам нужен первый отображаемый год в списке,
            //для того чтобы установить _position
            const yearToSet = this._getDisplayedYear(yearToCheck, delta) + ONLY_YEARS_LAST_ELEMENT_VISIBLE_INDEX;
            this.setYear(yearToSet);
        }
        this.setYear(this._getDisplayedYear(year, delta));
    },

    _onYearMouseLeave: function () {
        this._yearHovered = null;
    },

    _onHomeClick: function () {
        var periodType = 'year', period;
        if (this._options.chooseMonths) {
            periodType = 'month';
        } else if (this._options.chooseQuarters) {
            periodType = 'quarter';
        } else if (this._options.chooseHalfyears) {
            periodType = 'halfyear';
        }
        period = getCurrentPeriod(periodType);
        this.setYear((new Date()).getFullYear());
        this._notify(
            'sendResult',
            [new this._options.dateConstructor(period[0]), new this._options.dateConstructor(period[1])],
            {bubbling: true});
    },

    _onHeaderClick: function () {
        this._notify('close', [], {bubbling: true});
    },

    _onYearClick: function (event, year) {
        if (this._options.chooseYears) {
            this._notify(
                'sendResult',
                [new this._options.dateConstructor(year, 0, 1), new this._options.dateConstructor(year, 11, 31)],
                {bubbling: true});
        }
    },

    _getWidthCssClass: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog__width-big';
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__width-medium';
        }
        return 'controls-PeriodLiteDialog__width-small';
    },

    _getListCssClasses: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog-item controls-PeriodLiteDialog__fullYear-list';
        }
        if (this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__vLayout controls-PeriodLiteDialog__text-align-center ' +
                'controls-PeriodLiteDialog__month-list';
        }
        if (this._options.chooseQuarters) {
            return 'controls-PeriodLiteDialog__vLayout controls-PeriodLiteDialog__text-align-center ' +
                ' controls-PeriodLiteDialog__quarter-list';
        }
        return '';
    },

    _getYearWrapperCssClasses: function () {
        if (this._options.chooseHalfyears) {
            return 'controls-PeriodLiteDialog__yearWrapper__fullYear';
        }
        if (this._options.chooseQuarters || this._options.chooseMonths) {
            return 'controls-PeriodLiteDialog__yearWrapper__quarters-months';
        }
        return '';
    },

    _getYearCssClasses: function () {
        var css = [];
        if (this._options.chooseYears) {
            css.push('controls-PeriodLiteDialog__year-clickable');
        }
        if (this._options.chooseMonths && this._options.chooseQuarters && this._options.chooseHalfyears) {
            css.push('controls-PeriodLiteDialog__year-medium');
        } else if (this._options.chooseMonths) {
            css.push('controls-PeriodLiteDialog__year-center-lite');
        }
        return css.join(' ');
    },

    _getYearItemCssClasses: function (year) {
        var css = [],
            date = this._options.startValue;
        if (!dateUtils.isValidDate(date) || (year !== date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__vLayoutItem-clickable');
        }
        if (dateUtils.isValidDate(date) && (year === date.getFullYear())) {
            css.push('controls-PeriodLiteDialog__selectedYear');
        }
        return css.join(' ');
    }

});

Component._private = _private;

Component.EMPTY_CAPTIONS = IPeriodSimpleDialog.EMPTY_CAPTIONS;

Component.getDefaultOptions = function () {
    return {
        ...IPeriodSimpleDialog.getDefaultOptions(),
        itemTemplate: ItemWrapper,
        dateConstructor: WSDate
    };
};

Component.getOptionTypes = function () {
    return coreMerge({}, IPeriodSimpleDialog.getOptionTypes());
};

export default Component;
