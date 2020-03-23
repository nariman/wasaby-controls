import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/Menu/Control/GroupProperty/Simple/Index');
import {Memory} from 'Types/source';
import * as ControlsConstants from 'Controls/Constants';
import 'css!Controls-demo/Controls-demo';

class GroupProperty extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;

    protected _beforeMount(): void {
       this._source = new Memory({
            data: [
                { key: 1, title: 'Add', icon: 'icon-small icon-Bell', group: ControlsConstants.view.hiddenGroup},
                { key: 2, title: 'Vacation', iconStyle: 'success', icon: 'icon-small icon-Vacation', group: '2' },
                { key: 3, title: 'Time off', icon: 'icon-small icon-SelfVacation', group: '2' },
                { key: 4, title: 'Hospital', icon: 'icon-small icon-Sick', group: '2' },
                { key: 5, title: 'Business trip', icon: 'icon-small icon-statusDeparted', group: '2' }
            ],
            keyProperty: 'key'
        });
    }

    static _theme: string[] = ['Controls/Classes'];

}
export default GroupProperty;