import Control = require('Core/Control');
import template = require('wml!Controls/_lists/Mover/MoveDialog/MoveDialog');
import 'css!theme?Controls/_lists/Mover/MoveDialog/MoveDialog';

   /**
    * A standard dialog template for selecting a target item for moving items.
    * <a href="/materials/demo-ws4-operations-panel">Demo examples.</a>.
    * @class Controls/_lists/Mover/MoveDialog
    * @extends Core/Control
    * @mixes Controls/_lists/interface/IHierarchy
    * @mixes Controls/interface/IFilter
    * @mixes Controls/interface/ISource
    *
    * @mixes Controls/_lists/Mover/MoveDialog/Styles
    * @control
    * @public
    * @author Авраменко А.С.
    * @category List
    */

   /**
    * @name Controls/_lists/Mover/MoveDialog#root
    * @cfg {String} Identifier of the root node.
    * @default null
    */

   /**
    * @name Controls/Input/interface/ISearch#searchParam
    * @cfg {String} Name of the field that search should operate on. Search value will insert in filter by this parameter.
    */

   export = Control.extend({
      _template: template,
      _itemActions: undefined,

      _beforeMount: function(options) {
         this._itemActions = [{
            id: 1,
            title: rk('Выбрать'),
            showType: 2
         }];
         this._root = options.root;
         this._onItemClick = this._onItemClick.bind(this);
         this._itemsFilterMethod = this._itemsFilterMethod.bind(this);
         this._itemActionVisibilityCallback = this._itemActionVisibilityCallback.bind(this);
      },

      _itemsFilterMethod: function(item) {
         var result = true;

         if (item.get) {
            result = this._options.movedItems.indexOf(item.get(this._options.keyProperty)) === -1;
         }

         return result;
      },

      _itemActionVisibilityCallback: function(action, item) {
         return item.get(this._options.hasChildrenProperty);
      },

      _onItemClick: function(event, item) {
         if (!item.get(this._options.hasChildrenProperty)) {
            this._applyMove(item);
         }
      },

      _onItemActionsClick: function(event, action, item) {
         this._applyMove(item);
      },

      _applyMove: function(item) {
         this._notify('sendResult', [item, this._options.movedItems], {bubbling: true});
         this._notify('close', [], {bubbling: true});
      }
   });
