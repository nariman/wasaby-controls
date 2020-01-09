import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/grid/ItemActions/ItemActionsNoHighlight/ItemActionsNoHighlight"
import {Memory} from "Types/source"
import {getCountriesStats} from "../../DemoHelpers/DataCatalog"
import {getActionsForContacts as getItemActions} from "../../../list_new/DemoHelpers/ItemActionsCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = getCountriesStats().getColumnsWithFixedWidths().map((cur, i) => {
    if (i === 5) {
        return {
            ...cur,
                width: '350px'
            };
        }
    return cur;
    });
    private _itemActions = getItemActions();

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(1, 4)
        });
    }
}
