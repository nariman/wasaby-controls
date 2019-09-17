/**
 * Библиотека контролов, которые реализуют плоский список. Список может строиться по данным, полученным из источника. Также можно организовать удаление и перемещение данных.
 * Работа с шаблонами библиотеки описана в руководстве разработчика:
 * <ul>
 *    <li><a href="/doc/platform/developmentapl/interface-development/controls/list/list/templates/item/">ItemTemplate (шаблон отображения элемента)</a></li>
 *    <li><a href="/doc/platform/developmentapl/interface-development/controls/list/list/templates/grouping/">GroupTemplate (шаблон группировки)</a></li>
 *    <li><a href="/doc/platform/developmentapl/interface-development/controls/list/list/templates/empty/">EmptyTemplate (шаблон пустого списка)</a></li>
 *    <li><a href="/doc/platform/developmentapl/interface-development/controls/list/list/edit/">EditingTemplate (шаблон редактирования элемента)</a></li>
 * </ul>
 * @library Controls/list
 * @includes AddButton Controls/_list/AddButton
 * @includes Container Controls/_list/Container
 * @includes EmptyTemplate wml!Controls/_list/emptyTemplate
 * @includes GroupTemplate wml!Controls/_list/GroupTemplate
 * @includes ItemTemplate wml!Controls/_list/ItemTemplateChooser
 * @includes View Controls/_list/List
 * @includes Mover Controls/_list/Mover
 * @includes Remover Controls/_list/Remover
 * @includes Paging Controls/_paging/Paging
 * @includes VirtualScroll Controls/_list/Controllers/VirtualScroll
 * @includes DataContainer Controls/_list/Data
 * @includes AddButtonStyles Controls/_list/AddButton/Styles
 * @includes IHierarchy Controls/_interface/IHierarchy
 * @includes IList Controls/_list/interface/IList
 * @includes ISorting Controls/_interface/ISorting
 * @includes ListStyles Controls/_list/ListStyles
 * @includes ItemActionsStyles Controls/_list/ItemActions/ItemActionsStyles
 * @includes SwipeStyles Controls/_list/Swipe/SwipeStyles
 * @includes BaseControlStyles Controls/_list/BaseControlStyles
 * @includes ItemActionsHelper Controls/_list/ItemActions/Helpers
 * @includes HotKeysContainer Controls/_list/HotKeysContainer
 * @includes IVirtualScroll Controls/_list/interface/IVirtualScroll
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library Controls/list
 * @includes AddButton Controls/_list/AddButton
 * @includes Container Controls/_list/Container
 * @includes EmptyTemplate wml!Controls/_list/emptyTemplate
 * @includes GroupTemplate wml!Controls/_list/GroupTemplate
 * @includes ItemTemplate wml!Controls/_list/ItemTemplate
 * @includes View Controls/_list/List
 * @includes Mover Controls/_list/Mover
 * @includes Remover Controls/_list/Remover
 * @includes Paging Controls/_paging/Paging
 * @includes VirtualScroll Controls/_list/Controllers/VirtualScroll
 * @includes DataContainer Controls/_list/Data
 * @includes AddButtonStyles Controls/_list/AddButton/Styles
 * @includes IHierarchy Controls/_interface/IHierarchy
 * @includes IList Controls/_list/interface/IList
 * @includes ListStyles Controls/_list/ListStyles
 * @includes ItemActionsStyles Controls/_list/ItemActions/ItemActionsStyles
 * @includes SwipeStyles Controls/_list/Swipe/SwipeStyles
 * @includes BaseControlStyles Controls/_list/BaseControlStyles
 * @includes ItemActionsHelper Controls/_list/ItemActions/Helpers
 * @includes HotKeysContainer Controls/_list/HotKeysContainer
 * @includes IVirtualScroll Controls/_list/interface/IVirtualScroll
 * @public
 * @author Крайнов Д.О.
 */
import AddButton = require('Controls/_list/AddButton');
import Container = require('Controls/_list/Container');
import EmptyTemplate = require('wml!Controls/_list/emptyTemplate');
import GroupTemplate = require('wml!Controls/_list/GroupTemplate');
import ItemTemplate = require('wml!Controls/_list/ItemTemplateChooser');
import View = require('Controls/_list/List');
import Mover = require('Controls/_list/Mover');
import Remover = require('Controls/_list/Remover');
import VirtualScroll = require('Controls/_list/Controllers/VirtualScroll');
import DataContainer = require('Controls/_list/Data');
import _forTemplate = require('wml!Controls/_list/resources/For');

import * as GridLayoutUtil from 'Controls/_grid/utils/GridLayoutUtil';
import EditingTemplate = require('wml!Controls/_list/EditingTemplateChooser');
import ItemActionsHelpers = require('Controls/_list/ItemActions/Helpers');
import BaseViewModel = require('Controls/_list/BaseViewModel');
import ItemActionsControl = require('Controls/_list/ItemActions/ItemActionsControl');
import ListViewModel = require('Controls/_list/ListViewModel');
import ListControl = require('Controls/_list/ListControl');
import ListView = require('Controls/_list/ListView');
import SwipeTemplate = require('wml!Controls/_list/Swipe/resources/SwipeTemplate');
import SwipeHorizontalMeasurer = require('Controls/_list/Swipe/HorizontalMeasurer');
import 'css!theme?Controls/list';
import GroupContentResultsTemplate = require('wml!Controls/_list/GroupContentResultsTemplate');
import ItemOutputWrapper = require('wml!Controls/_list/resources/ItemOutputWrapper');
import ItemOutput = require('wml!Controls/_list/resources/ItemOutput');
import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil');
import TreeItemsUtil = require('Controls/_list/resources/utils/TreeItemsUtil');
import BaseControl = require('Controls/_list/BaseControl');
import ScrollEmitter = require('Controls/_list/BaseControl/Scroll/Emitter');
import SearchItemsUtil = require('Controls/_list/resources/utils/SearchItemsUtil');
import ItemsView = require('Controls/_list/ItemsView');
import ItemsViewModel = require('Controls/_list/ItemsViewModel');
import getStyle = require('Controls/_list/ItemActions/Utils/getStyle');
import HotKeysContainer from 'Controls/_list/HotKeysContainer';
import InertialScrolling from 'Controls/_list/resources/utils/InertialScrolling';

import {Paging} from 'Controls/paging';

export {
    AddButton,
    Container,
    EmptyTemplate,
    GroupTemplate,
    ItemTemplate,
    View,
    Mover,
    Remover,
    Paging,
    VirtualScroll,
    DataContainer,
    _forTemplate,

    GridLayoutUtil,
    EditingTemplate,
    ItemActionsHelpers,
    BaseViewModel,
    ItemActionsControl,
    ListViewModel,
    ListControl,
    ListView,
    SwipeTemplate,
    SwipeHorizontalMeasurer,
    GroupContentResultsTemplate,
    ItemOutputWrapper,
    ItemOutput,
    ItemsUtil,
    TreeItemsUtil,
    BaseControl,
    ScrollEmitter,
    SearchItemsUtil,
    getStyle,
    ItemsView,
    ItemsViewModel,
    HotKeysContainer,
    InertialScrolling
};
