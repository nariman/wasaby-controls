import {IFormatMaskChars, getDefaultMaskOptions} from '../interface/IMask';
import {getFormat} from './FormatBuilder';
import {splitValue} from './Formatter';

const DEFAULT_OPTIONS = getDefaultMaskOptions();

/**
 * Проверяет соответствие значения формату маски.
 * @function
 * @name Controls/_input/Mask/isFormatValid#isFormatValid
 * @returns {Boolean} соответствует ли значение формату маски.
 */
function isFormatValid(
    value: string, mask: string,
    replacer: string = DEFAULT_OPTIONS.replacer,
    formatMaskChars: IFormatMaskChars = DEFAULT_OPTIONS.formatMaskChars
): boolean {
    try {
        const format = getFormat(mask, formatMaskChars, replacer);
        splitValue(format, value);
        return true;
    } catch {
        return false;
    }
}

export default isFormatValid;
