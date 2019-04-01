define('Controls-demo/List/Grid/Grid', [
   'Core/Control',
   'Controls-demo/List/Grid/GridData',
   'wml!Controls-demo/List/Grid/Grid',
   'Types/source',
   'wml!Controls-demo/List/Grid/DemoItem',
   'wml!Controls-demo/List/Grid/DemoBalancePrice',
   'wml!Controls-demo/List/Grid/DemoCostPrice',
   'wml!Controls-demo/List/Grid/DemoHeaderCostPrice',
   'wml!Controls-demo/List/Grid/DemoName',
   'Controls/Render/Money/Money',
   'css!Controls-demo/List/Grid/Grid',
   'Controls/Container/Scroll',
   'Controls/grids',
   'wml!Controls-demo/List/Grid/Results',
   'Controls/Render/Money/Money'
], function(BaseControl, GridData, template, source) {
   'use strict';
   var
      partialColumns = [
         {
            displayProperty: 'name',
            width: '1fr',
            template: 'wml!Controls-demo/List/Grid/DemoName'
         },
         {
            displayProperty: 'price',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         }
      ],
      partialColumns2 = [
         {
            displayProperty: 'name',
            width: '1fr',
            template: 'wml!Controls-demo/List/Grid/DemoName'
         },
         {
            displayProperty: 'costPrice',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         }
      ],
      fullColumns = [
         {
            displayProperty: 'name',
            width: '1fr',
            template: 'wml!Controls-demo/List/Grid/DemoName'
         },
         {
            displayProperty: 'price',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         },
         {
            displayProperty: 'balance',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoBalancePrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: 7893.87
         },
         {
            displayProperty: 'reserve',
            width: 'auto',
            align: 'right'
         },
         {
            displayProperty: 'costPrice',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice',
            resultTemplate: 'wml!Controls-demo/List/Grid/Results',
            result: 983.36
         },
         {
            displayProperty: 'balanceCostSumm',
            width: 'auto',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoCostPrice'
         }
      ],
      partialHeader = [
         {
            title: ''
         },
         {
            title: 'Цена',
            align: 'right'
         }
      ],
      fullHeader = [
         {
            title: ''
         },
         {
            title: 'Цена',
            align: 'right'
         },
         {
            title: 'Остаток',
            align: 'right',
            sortingProperty: 'balance'
         },
         {
            title: 'Резерв',
            align: 'right'
         },
         {
            title: 'Себест.',
            align: 'right',
            template: 'wml!Controls-demo/List/Grid/DemoHeaderCostPrice'
         },
         {
            title: 'Сумма остатка',
            align: 'right'
         }
      ],
      ModuleClass = BaseControl.extend({
         _template: template,
         _actionClicked: '',
         _fullSet: true,
         _itemActions: null,
         _viewSource: null,
         _sorting: [],
         _selectKeyColumn: null,
         _columnSource: null,
         gridColumns: null,
         gridColumns2: null,
         gridHeader: null,
         showType: null,
         _showAction: function(action, item) {
            if (item.get('id') === '471329') {
               if (action.id === 2 || action.id === 3) {
                  return false;
               }
               return true;
            }
            if (action.id === 5) {
               return false;
            }
            if (item.get('id') === '448390') {
               return false;
            }

            return true;
         },
         _onActionClick: function(event, action, item) {
            this._actionClicked = action.title;
         },
         _beforeMount: function() {
            this._firstSelectedKeys = ['448390'];
            this._secondSelectedKeys = ['448390'];
            this.showType = {

               // show only in Menu
               MENU: 0,

               // show in Menu and Toolbar
               MENU_TOOLBAR: 1,

               // show only in Toolbar
               TOOLBAR: 2
            };
            this._viewSource = new source.Memory({
               idProperty: 'id',
               data: GridData.catalog
            });
            this._itemActions = [
               {
                  id: 5,
                  title: 'прочитано',
                  showType: this.showType.TOOLBAR,
                  handler: function() {
                     console.log('action read Click');
                  }
               },
               {
                  id: 1,
                  icon: 'icon-primary icon-PhoneNull',
                  title: 'phone',
                  handler: function(item) {
                     console.log('action phone Click ', item);
                  }
               },
               {
                  id: 2,
                  icon: 'icon-primary icon-EmptyMessage',
                  title: 'message',
                  handler: function() {
                     alert('Message Click');
                  }
               },
               {
                  id: 3,
                  icon: 'icon-primary icon-Profile',
                  title: 'profile',
                  showType: this.showType.MENU_TOOLBAR,
                  handler: function() {
                     console.log('action profile Click');
                  }
               },
               {
                  id: 4,
                  icon: 'icon-Erase icon-error',
                  title: 'delete pls',
                  showType: this.showType.TOOLBAR,
                  handler: function() {
                     console.log('action delete Click');
                  }
               }
            ];
            this.gridColumns = fullColumns;
            this.gridHeader = fullHeader;

            this._columnSource = new source.Memory({
               data: [
                  { key: 'price', title: 'Цена' },
                  { key: 'costPrice', title: 'Себестоимость' }
               ],
               idProperty: 'key'
            });
            this.gridColumns2 = partialColumns;

            this._selectKeyColumn = ['price'];
         },
         _onToggleColumnsClicked: function() {
            this._fullSet = !this._fullSet;
            this.gridColumns = this._fullSet ? fullColumns : partialColumns;
            this.gridHeader = this._fullSet ? fullHeader : partialHeader;
            this._forceUpdate();
         },

         _selectedKeysChangeColumn: function(event, field) {
            this.gridColumns2 = field[0] === 'price' ? partialColumns : partialColumns2;
         }
      });

   return ModuleClass;
});
