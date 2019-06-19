import uDimension = require("Controls/Utils/getDimensions");
import {IoC} from "Env/Env";
/**
 * TODO: Сделать правильные экспорты, чтобы можно было и в js писать просто new VirtualScroll() и в TS файле использовать типы
 */

/**
 * Configuration object.
 *
 * @typedef VirtualScrollConfig
 * @type {object}
 * @property {number} virtualPageSize - The size of the virtual page indicates maximum number of simultaneously displayed items in the list.
 * @property {number} virtualSegmentSize - Number of items that will be inserted/removed on reaching the end of displayed items.
 */
type VirtualScrollConfig = {
    virtualPageSize?: number;
    virtualSegmentSize?: number;
}


/**
 * HTML container with elements.
 *
 * @typedef ItemsContainer
 * @type {Object}
 * @property {Array<HTMLElement>} children List items
 */
type ItemsContainer = {
    children: Array<HTMLElement>;
};


/**
 * Indexes of elements that should be mounted into the DOM.
 *
 * @remark The stop index is higher than the last item to show by one
 * @typedef ItemsIndexes
 * @type {Object}
 * @property {number} start - Index of the first element.
 * @property {number} stop - Index of the last element.
 */
type ItemsIndexes = {
    start: number;
    stop: number;
};


/**
 * The size of the placeholders that should be displayed instead of the "excessive" items.
 *
 * @typedef PlaceholdersSizes
 * @type {Object}
 * @property {number} top
 * @property {number} bottom
 */
type PlaceholdersSizes = {
    top: number;
    bottom: number;
};



/**
 *
 * @class Controls/_list/Controllers/VirtualScroll
 * @mixes Controls/_list/interface/IVirtualScroll
 *
 * @public
 * @author Родионов Е.А.
 */
class VirtualScroll {

    private readonly _virtualSegmentSize: number = 10;
    private readonly _virtualPageSize: number = 100;

    private _startIndex: number = 0;
    private _stopIndex: number;
    private _itemsCount: number;
    private _itemsHeights: number[] = [];
    private _itemsContainer: ItemsContainer;
    private _topPlaceholderSize: number = 0;
    private _bottomPlaceholderSize: number = 0;


    get ItemsIndexes(): ItemsIndexes {
        return {
            start: this._startIndex,
            stop: this._stopIndex
        };
    }

    get ItemsHeights(): Array<number> {
        return this._itemsHeights;
    }

    get PlaceholdersSizes(): PlaceholdersSizes {
        return {
            top: this._topPlaceholderSize,
            bottom: this._bottomPlaceholderSize
        };
    }

    set ItemsCount(value: number) {
        this._itemsCount = value;
    }

    set ItemsContainer(value: ItemsContainer) {
        this._itemsContainer = value;
        this.updateItemsSizes();
    }

    get ItemsContainer(): ItemsContainer {
        return this._itemsContainer;
    }

    /**
     * @constructor
     * @this  {VirtualScroll}
     * @param {VirtualScrollConfig} cfg
     */
    public constructor(cfg: VirtualScrollConfig) {
        this._virtualPageSize = cfg.virtualPageSize || this._virtualPageSize;
        this._virtualSegmentSize = cfg.virtualSegmentSize || this._virtualSegmentSize;
        this._stopIndex = this._startIndex + this._virtualPageSize;
    }


    public resetItemsIndexes(): void {
        this._startIndex = 0;
        this._stopIndex = this._startIndex + this._virtualPageSize;
        this._itemsHeights = [];
        this._topPlaceholderSize = this._bottomPlaceholderSize = 0;
    }

    public updateItemsSizes(): void {
        let
            startUpdateIndex = this._startIndex,
            items = this._itemsContainer.children,
            updateLength = Math.min(this._stopIndex - this._startIndex, items.length);

        this._updateItemsSizes(startUpdateIndex, updateLength);
        this._updatePlaceholdersSizes();

    }

    //TODO Add enum BaseControl.Direction(LoadDirection) or List.Direction(LoadDirection)
    public updateItemsIndexes(direction: String): void {
        if (direction === 'down') {
            this._startIndex = this._startIndex + this._virtualSegmentSize;
            this._startIndex = Math.min(this._startIndex, this._itemsCount - this._virtualPageSize);
        } else {
            this._startIndex = this._startIndex - this._virtualSegmentSize;
        }
        this._startIndex = Math.max(0, this._startIndex);
        this._stopIndex = Math.min(this._itemsCount, this._startIndex + this._virtualPageSize);
        this._updatePlaceholdersSizes();
    }

    public insertItemsHeights(itemIndex: number, itemsHeightsCount: number): void {
        let topItemsHeight = this._itemsHeights.slice(0, itemIndex + 1),
            insertedItemsHeights = [],
            bottomItemsHeight = this._itemsHeights.slice(itemIndex + 1);

        for (let i = 0; i < itemsHeightsCount; i++) {
            insertedItemsHeights[i] = 0;
        }

        this._itemsHeights = topItemsHeight.concat(insertedItemsHeights, bottomItemsHeight);
        this._stopIndex = Math.min(this._itemsCount, this._startIndex + this._virtualPageSize);
        this._updatePlaceholdersSizes();
    }

    public cutItemsHeights(itemIndex: number, itemsHeightsCount: number): void {
        this._itemsHeights.splice(itemIndex + 1, itemsHeightsCount);
        this._stopIndex = Math.min(this._itemsCount, this._startIndex + this._virtualPageSize);
        this._updatePlaceholdersSizes();
    }

    public updateItemsIndexesOnScrolling(scrollTop: number, containerHeight: number): void {
        if (this._isScrollInPlaceholder(scrollTop, containerHeight)) {
            let
                offsetHeight = 0,
                heightsCount = this._itemsHeights.length;
            if (fix1177345288) {
                heightsCount && !this._itemsHeights[0] && this._updateItemsSizes(0, Math.min(heightsCount, this._virtualPageSize));
            }
            for (let i = 0; i < heightsCount; i++) {
                offsetHeight += this._itemsHeights[i];

                // Находим первую видимую запись по скролл топу и считаем этот элемент серединой виртуальной страницы
                if (offsetHeight >= scrollTop) {
                    this._startIndex = Math.max(0, Math.ceil(i - this._virtualPageSize / 2));

                    // Проверяем, что собираемся показать элементы, которые были отрисованы ранее
                    if (this._startIndex + this._virtualPageSize > heightsCount) {
                        this._stopIndex = heightsCount;
                        this._startIndex = Math.max(0, heightsCount - this._virtualPageSize);
                    } else {
                        this._stopIndex = Math.min(this._startIndex + this._virtualPageSize, heightsCount);
                    }
                    break;
                }
            }

            this._updatePlaceholdersSizes();
        }
    }


    private _isScrollInPlaceholder(scrollTop: number, containerHeight: number = 0): boolean {
        let itemsHeight = 0,
            topPlaceholderSize = this._getItemsHeight(0, this._startIndex);
        for (let i = this._startIndex; i < this._stopIndex; i++) {
            itemsHeight += this._itemsHeights[i];
        }
        return (scrollTop <= topPlaceholderSize || (scrollTop+containerHeight) >= (itemsHeight + topPlaceholderSize));
    }

    private _getItemsHeight(startIndex: number, stopIndex: number): number {
        let height = 0,
            heights = this._itemsHeights;
        if (typeof heights[startIndex] !== "undefined" && typeof heights[stopIndex - 1] !== "undefined") {
            for (let i = startIndex; i < stopIndex; i++) {
                height += heights[i];
            }
        }
        return height;
    }

    private _updatePlaceholdersSizes(): void {
        this._topPlaceholderSize = this._getItemsHeight(0, this._startIndex);
        this._bottomPlaceholderSize = this._getItemsHeight(this._stopIndex, this._itemsHeights.length);
    }

    private _updateItemsSizes(startUpdateIndex, updateLength, isUnitTesting = false): void {
        if (isUnitTesting) {
            for (let i = 0; i < updateLength; i++) {
                this._itemsHeights[startUpdateIndex + i] = this._getRowHeight(this._itemsContainer.children[i], isUnitTesting);
            }
        }
    }

    private _getRowHeight(row: HTMLElement, isUnitTesting: boolean): number {
        /*
         * uDimension работает с window, для того чтобы протестировать функцию есть параметр isUnitTesting
         */
        return isUnitTesting ? row.offsetHeight : uDimension(row).height;
    }
}

export = VirtualScroll;
