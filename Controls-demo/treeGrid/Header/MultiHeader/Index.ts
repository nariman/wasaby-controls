import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/treeGrid/Header/MultiHeader/MultiHeader"
import {Memory} from "Types/source"
import {Gadgets} from "../../DemoHelpers/DataCatalog"

import 'css!Controls-demo/Controls-demo'

export default class extends Control {
   protected _template: TemplateFunction = Template;
   private _viewSource: Memory;
   private _columns = Gadgets.getGridColumnsForFlat();
   private _header = Gadgets.getMultiHeader();

   protected _beforeMount() {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: Gadgets.getFlatData()
      });
   }
}
