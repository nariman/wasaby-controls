import {Control, TemplateFunction} from 'UI/Base';
import {Memory, SbisService, ICrud} from 'Types/source';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/DevicesInfo/DevicesInfo';
import {date as format} from 'Types/formatter';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import RecordSynchronizer = require('Controls/Utils/RecordSynchronizer');

import {getActionsForDevices, getColumns, getActionsForBlockedDevices, getActionsForFailedTries, getLockedDevices, getFailingAuth, getActivityDevices} from 'Controls-demo/DevicesInfo/testingHelper';

import * as Template from 'wml!Controls-demo/DevicesInfo/DevicesInfo';

interface INoStickyLadderColumn {
    template: string;
    width: string;
}

export default class extends Control {
    private _blockedDevicesShown: boolean;
    private _devicesShown: boolean;
    private _failedTriesShown: boolean;

    private _blockedDevicesInvisible: boolean;
    private _failedTriesInvisible: boolean;

    protected _navigation: INavigationOptionValue<INavigationSourceConfig>;
    protected _template: TemplateFunction = Template;
    protected _viewSourceDevicesInfo: Memory;
    protected _itemActions;
    protected _itemActionFailedTries;
    protected _itemActionBlockedDevices;
    protected _columns: INoStickyLadderColumn[] = getColumns();

    protected _beforeMount(options?: {}, contexts?: object, receivedState?: void): Promise<void> | void {

        this._navigation = {
            source: 'page',
            view: 'demand',
            sourceConfig: {
                pageSize: 3,
                page: 0,
                hasMore: false
            }
        };

        this._blockedDevicesNavigation = {
            source: 'page',
            view: 'demand',
            sourceConfig: {
                pageSize: 3,
                page: 0,
                hasMore: false
            }
        };

        this._failedTriesNavigation = {
            source: 'page',
            view: 'demand',
            sourceConfig: {
                pageSize: 3,
                page: 0,
                hasMore: false
            }
        };

        this._blockedDevicesInvisible = false;
        this._failedTriesInvisible = false;

        this._failedTriesShown = false;
        this._blockedDevicesShown = false;
        this._devicesShown = false;

        this._itemActions = getActionsForDevices();
        this._itemActionFailedTries = getActionsForFailedTries();
        this._itemActionBlockedDevices = getActionsForBlockedDevices();

        if (receivedState) {
            this._setSource(receivedState);
        } else {
            return new Promise((resolve) => {
                const devices = new RecordSet({
                    rawData: getActivityDevices().map((item) => {
                            this._formatData(item);
                            return item;
                    }),
                    keyProperty: 'id'
                });
                const blockedDevices = new RecordSet({
                    rawData: getLockedDevices().map((item) => {
                            this._formatData(item);
                            return item;
                    }),
                    keyProperty: 'id'
                });

                const failedTries = new RecordSet({
                    rawData: getFailingAuth().map((item) => {
                            this._formatData(item);
                            return item;
                    }),
                    keyProperty: 'id'
                });

                const fullInfo = {devices: devices, blockedDevices: blockedDevices, failedTries: failedTries};

                this._setSource(fullInfo);
                resolve(fullInfo);
            });
        }
    }
    private _formatData(item): void {
        item['Date'] = format(new Date(item['Date']), format.FULL_DATE_SHORT_TIME);
        item['entryTypeIconData'] = this._getEntryTypeIcon(item);
        item['deviceIconData'] = {
            icon: this._getDeviceIconTypeClass(item),
            title: this._getDeviceIconTypeTitle(item)
        };
    }

    protected _actionDevicesClick(event: Event, action, item): void {
        switch (action.id) {
            case 0:
                this._clearSessionDevice(item);
                break;
            case 1:
                this._switchLock(item, true , true);
                break;
            case 3:
                this._changeType(item, 1);
                break;
            case 4:
                this._changeType(item, 2);
                break;
            case 5:
                this._changeType(item, 3);
                break;
            case 6:
                this._changeType(item, 4);
                break;
        }
    }
    protected _actionBlockedDevicesClick(e, action, item, container): void {
        this._switchLock(item, false);
    }

    protected _actionFailedTriesClick(e, action, item, container): void {
        this._switchLock(item, true);
    }

    private _setSource(state): void {
        this._viewSourceDevices = new Memory({
            keyProperty: 'id',
            data: state.devices.getRawData()
        });

        this._viewSourceBlockedDevices = new Memory({
            keyProperty: 'id',
            data: state.blockedDevices.getRawData()
        });
        if (!state.blockedDevices.getRawData()) {
            this._blockedDevicesInvisible = true;
        }
        this._viewSourceFailedTries = new Memory({
            keyProperty: 'id',
            data: state.failedTries.getRawData()
        });
        if (!state.failedTries.getRawData()) {
            this._failedTriesInvisible = true;
        }
    }

    private _getBLObject(name): ICrud {
        return new SbisService({
            endpoint: name || "ДоверенноеУстройство"
        });

    }

    private _switchLock(item, lock, lockFromDevices): void {
        //Демо реализация
        if (lock) {
            if (lockFromDevices) {
                RecordSynchronizer.deleteRecord(
                    new RecordSet({rawData: this._viewSourceDevices.data, keyProperty: '@Id'}),
                    item.getId());
                this._children.devices.reload();
            } else {
                RecordSynchronizer.deleteRecord(
                    new RecordSet({rawData: this._viewSourceFailedTries.data, keyProperty: '@Id'}),
                    item.getId());
                if (!this._viewSourceFailedTries.data.length) {
                    this._failedTriesInvisible = true;
                }
                this._children.failedTries.reload();
            }
            item._$rawData().Blocked = true;
            this._blockedDevicesInvisible = false;
            RecordSynchronizer.addRecord(item, {},
                 new RecordSet({rawData: this._viewSourceBlockedDevices.data, keyProperty: '@Id'}));
            this._children.blockedDevices.reload();
        } else {
            RecordSynchronizer.deleteRecord(
                new RecordSet({rawData: this._viewSourceBlockedDevices.data, keyProperty: '@Id'}), item.getId());
                if (!this._viewSourceBlockedDevices.data.length) {
                    this._blockedDevicesInvisible = true;
                }
            this._children.blockedDevices.reload();
        }
        this._forceUpdate();
        //Настоящая раелизация
        // this._getBLObject().call(lock? "Lock" : "Unlock", {
        //     "id": item.get('Пользователь')
        // }).addCallback(() => {
        //     this._children.devices.reload();
        // }).addErrback(function () {
        //     console.error(lock ? "Не удалось заблокировать!" : "Не удалось разблокировать!");
        // });
    }

    //Такого нет в новой версии
    // private _switchTrusted(event, item, trust, child) {
    //     this._getBLObject().call("Сменить", {
    //         "Ид": item["id"],
    //         "Доверия": trust,
    //         "ИдЮз": item['Пользователь']
    //     }).addCallback(function () {
    //         this._children.child.reload();
    //     }).addErrBack(function() {
    //         console.log("Не удалось сменить доверие");
    //     });
    // }

    private _changeType(item, type) {
        let changeType = () => {
            this._getBLObject().call('ChangeType', {
                device_id: item.get('DeviceId'),
                device_type: item['DeviceType']
            }).addCallBack(function() {
                this._children.child.reload();
            }).addErrBack(function() {
                console.log('Не удалось поменять тип устройства');
            });
        };
        if (item['DeviceType'] === 1) {
            new SbisService({
                endpoint: 'UnproductiveLog'
            }).call('GetSettings', {}).addCallBack(function(result) {
                if (result && result.getRow && result.getRow().get('IsEnabled')) {
                    //Поддверждение
                    console.log('Изменив статус устройства на рабочий, вы разрешаете системе вести учет времени использования программ и посещения сайтов с этого устройства.');
                    console.log('Сохранить изменения?');
                    changeType();
                } else {
                    changeType();
                }
            }).addErrBack(function () {
                changeType();
            });
        } else {
            changeType();
        }
    }

    private _clearSessionDevice(item) {
        let clearSession = () => {
            this._getBLObject().call("ClearSession", {
                "key" : item.get("@УстройстваПользователя")
            }).addCallBack(() => {
                this._children.devices.reload();
            }).addErrback(() => {
                console.log('Не удалось завершить сессию');
            });
        };

        if (item['Мое']) {
            console.log('Завершить текущий сеанс?');
            //Да или Нет
            clearSession();
        } else {
            clearSession();
        }
    }

    private _toggleDevices(): void {
        if (this._viewSourceDevices.data.length > 3) {
            if (this._devicesShown) {
                this._navigation.sourceConfig.pageSize = 3;
            } else {
                this._navigation.sourceConfig.pageSize = this._viewSourceDevices.data.length;
            }
            this._children.devices.reload();
            this._devicesShown = !this._devicesShown;
        }
    }

    private _toggleBlockedDevices(): void {
        if (this._viewSourceBlockedDevices.data.length > 3) {
            if (this._blockedDevicesShown) {
                this._blockedDevicesNavigation.sourceConfig.pageSize = 3;
            } else {
                this._blockedDevicesNavigation.sourceConfig.pageSize = this._viewSourceBlockedDevices.data.length;
            }
            this._children.blockedDevices.reload();
            this._blockedDevicesShown = !this._blockedDevicesShown;
        }
    }

    private _toggleFailedTries(): void {
        if (this._viewSourceFailedTries.data.length > 3) {
            if (this._failedTriesShown) {
                this._failedTriesNavigation.sourceConfig.pageSize = 3;
            } else {
                this._failedTriesNavigation.sourceConfig.pageSize = this._viewSourceFailedTries.data.length;
            }
            this._children.failedTries.reload();
            this._failedTriesShown = !this._failedTriesShown;
        }
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

        switch (item['DeviceType']) {
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

        if (item['DeviceType']) {
            if (item['DeviceType'] !== 3) {
                if (item['IsPlugin']) {
                    title += ', ' + 'плагин установлен';
                } else {
                    title += ', ' + 'плагин не установлен';
                }
            }
        } else {
            if (item['IsPlugin']) {
                title = 'Установлен плагин';
            }
        }

        return title;
    }

    _getDeviceIconTypeClass(item) {
        let icon;

        switch(item['DeviceType']) {
            case 0:
                if (item['IsPlugin']) {
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

        return 'icon-16 icon-' + icon + ' icon-' + (item['IsPlugin'] && item['type'] !== 3 ? 'done' : 'primary')
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
