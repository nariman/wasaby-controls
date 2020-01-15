import {IControlOptions, TemplateFunction} from 'UI/Base';
import {ISourceOptions, IFilter} from 'Controls/interface';

export type TKeys = string[]|number[];

export interface IMenuOptions extends IControlOptions, ISourceOptions, IFilter {
    displayProperty: string;
    itemTemplate?: TemplateFunction;
    emptyText?: string;
    emptyKey?: string|number;
    historyConfig: IHistoryConfig;
    horizontalAlign: 'left'|'right';
    leftSpacing: string;
    rightSpacing: string;
    multiSelect?: boolean;
    navigation?: object;
    nodeFooterTemplate: TemplateFunction;
    nodeProperty?: string;
    parentProperty?: string;
    root?: string|number|null;
    selectedKeys?: TKeys;
    selectorTemplate?: object;
    selectorOpener?: object;
    selectorDialogResult?: Function;
    isCompoundTemplate?: boolean;
}

export interface IHistoryConfig {
    historyId: string;
    pinned: TKeys|boolean;
    recent: boolean;
    frequent: boolean;
}

/*
 * @interface Controls/_interface/IMenu
 * @public
 * @author Золотова Э.Е.
 */

/*
 * @interface Controls/_interface/IMenu
 * @public
 * @author Золотова Э.Е.
 */
export default interface IMenu {
    readonly '[Controls/_interface/IMenu]': boolean;
}
