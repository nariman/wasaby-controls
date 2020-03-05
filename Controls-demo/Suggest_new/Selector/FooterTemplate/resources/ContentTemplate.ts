import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import {_departmentsDataLong} from 'Controls-demo/Suggest_new/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Suggest_new/Selector/FooterTemplate/resources/ContentTemplate');
import 'css!Controls-demo/Controls-demo';

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    private _source: Memory;

    protected _beforeMount() {
        this._source = new Memory({
            keyProperty: 'id',
            data: _departmentsDataLong
        });
    }
}
