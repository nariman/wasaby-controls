import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Decorator/Number/RoundMode/RoundMode');

class RoundMode extends Control<IControlOptions> {
    protected _value = '12345.67890';
    protected _fractionSize = 2;

    protected _template: TemplateFunction = controlTemplate;

    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export default RoundMode;
