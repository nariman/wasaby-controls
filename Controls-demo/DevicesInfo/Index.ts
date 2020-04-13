import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/DevicesInfo/DevicesInfo';
import {date as format} from 'Types/formatter';

import {getDevicesTrusted, getActionsForDevices, getColumns, getActionsForBlockedDevices, getActionsForFailedTries} from 'Controls-demo/DevicesInfo/testingHelper';

import * as Template from 'wml!Controls-demo/DevicesInfo/DevicesInfo';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    private  _filter: {};
    private  _failedTriesFilter: {};
    private  _blockedDevicesFilter: {};
    private _blockedDevicesShown: boolean;
    private _devicesShown: boolean;
    private _failedTriesShown: boolean;
    protected _template: TemplateFunction = Template;
    protected _viewSourceDevicesInfo: Memory;
    protected _itemAction;
    protected _columns: INoStickyLadderColumn[] = getColumns();

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {
        this.hello ='hello';
        this._filter = {
            id: [0, 1, 2]
        };

        this._failedTriesFilter = {
            id: [0, 1, 2]
        };

        this._blockedDevicesFilter = {
            id: [0, 1, 2]
        };
        this._failedTriesShown = false;
        this._blockedDevicesShown = false;
        this._devicesShown = false;

        this._arrowState = true;

        this._itemActions = getActionsForDevices();
        this._itemActionFailedTries = getActionsForFailedTries();
        this._itemActionBlockedDevices = getActionsForBlockedDevices();

         this._viewSourceDevicesInfo = new Memory({
            keyProperty: 'Blocked',
            data: getDevicesTrusted().getData()
        });
        this._viewSourceDevicesInfo.data.forEach((item)=>{
            item['ПоследнийВход'] = new Date(item['ПоследнийВход']);
            item.format = format;
            item['entryTypeIconData'] = this._getEntryTypeIcon(item);
            // item['entryIconData'] = this._getEntryIconData(item);
            item['deviceIconData'] = {
                icon: this._getDeviceIconTypeClass(item),
                title: this._getDeviceIconTypeTitle(item)
            };
        });
    }

    private _toggleDevices(): void {
        if (this._devicesShown) {
            this._filter = {
                id: [0, 1, 2]
            };
        } else {
            this._filter = null;
        }
        this._devicesShown = !this._devicesShown;
    }

    private _toggleBlockedDevices(): void {
        if (this._blockedDevicesShown) {
            this._blockedDevicesFilter = {
                id: [0, 1, 2]
            };
        } else {
            this._blockedDevicesFilter = null;
        }
        this._blockedDevicesShown = !this._blockedDevicesShown;
    }

    private _toggleFailedTries(): void {
        if (this._failedTriesShown) {
            this._failedTriesFilter = {
                id: [0, 1, 2]
            };
        } else {
            this._failedTriesFilter = null;
        }
        this._failedTriesShown = !this._failedTriesShown;
    }

    _getEntryTypeIcon(item) {
        let
            title = "Вход по ",
            icon = "";

        switch(item['EnterType']) {
            case "00ce":
            case "0ece":
            case "0bce":
            case "00ca":
            case "00cb":
                icon = 'CommercialSignature';
                title += "сертификату";
                break;
            case "00ba":
            case "eeba":
            case "0eba":
            case "0bba":
                icon = 'Key';
                title += "логину";
                break;
            case '00de':
                icon = 'Badge';
                title += "пропуску/карте";
                break;
            case '00db':
                icon = 'Finger';
                title += "отпечатку пальца";
                break;
            case '00ac':
                icon = 'Chat';
                title = 'Вход через социальную сеть';
                break;
            case '00ad':
                icon = 'LDAPnew';
                title = 'Вход через LDAP';
                break;
            case '00be':
                icon = 'statusConnected';
                title += 'номеру телефона';
                break;
            case '00ee':
                icon = 'ConnectionPeriod';
                title = 'Вход через переключение аккаунта';
                break;
            default:
                title = '';
        }
        if (icon) {
            icon = 'icon-16 icon-' + icon + ' icon-primary DevicesTrusted__iconDeviceType';
        }
        return {icon: icon, title: title};
    }
    _getDeviceIconTypeTitle(item) {
        let title;

        switch (item['type']) {
            case 1:
                title = 'Рабочее устройство';
                break;
            case 2:
                title = 'Домашнее устройство';
                break;
            case 3:
                title = 'Мобильное устройство';
                break;
        }

        if (item['type']) {
            if (item['type'] !== 3) {
                if (item['is_plugin']) {
                    title += ', ' + 'плагин установлен';
                } else {
                    title += ', ' + 'плагин не установлен';
                }
            }
        } else {
            if (item['is_plugin']) {
                title = 'Установлен плагин';
            }
        }

        return title;
    }

    _getDeviceIconTypeClass(item) {
        let icon;

        switch(item['type']) {
            case 0:
                if (item['is_plugin']) {
                    icon = 'SabyBird';
                }
                break;
            case 1:
                icon = 'TFComputer';
                break;
            case 2:
                icon = 'Home';
                break;
            case 3:
                icon = 'PhoneCell';
                break;
        }

        return 'icon-16 icon-' + icon + ' icon-' + (item['is_plugin'] && item['type'] !== 3 ? 'done' : 'primary')
                + ' DevicesTrusted__iconDeviceType';
    }
    // Использовалось в старой версии, возмодно пригодится и сейчас,
    // wml: <div title="{{itemData.item['entryIconData'].title}}" class="{{itemData.item['entryIconData'].icon}}"></div>
    // js:
    // _getEntryIconData(item) {
    //     let icon, title;
    //
    //     if (item['Blocked']) {
    //         icon = 'icon-16 icon-Decline icon-error';
    //         title = 'Вход запрещен';
    //     } else if (item['Доверенное'])) {
    //         icon = 'icon-16 icon-Successful icon-primary';
    //         title = 'Вход без подтверждения';
    //     } else if (item['New']) {
    //         icon = 'icon-16 icon-Alert icon-attention';
    //         title = 'Новое устройство';
    //     }
    //
    //     if (icon) {
    //         return {icon: icon, title: title}
    //     }
    // }
}
