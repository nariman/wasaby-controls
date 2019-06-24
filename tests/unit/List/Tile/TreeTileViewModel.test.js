define(['Controls/_tile/TreeTileView/TreeTileViewModel', 'Types/collection'], function(TreeTileViewModel, collection) {
   'use strict';

   describe('Controls/_tile/TreeTileView/TreeTileViewModel', function() {
      var
         treeTileViewModel = new TreeTileViewModel({
            tileMode: 'static',
            itemsHeight: 300,
            imageProperty: 'image',
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            groupingKeyCallback: function(item) {
               return item.get('group');
            },
            items: new collection.RecordSet({
               rawData: [{
                  'id': 1,
                  'parent': null,
                  'parent@': true,
                  'group': '1'
               }, {
                  'id': 2,
                  'parent': null,
                  'parent@': null,
                  'group': '1'
               }],
               idProperty: 'id'
            }),
            expandedItems: [1, 2, 3],
            collapsedItems: [4, 5]
         });

      it('constructor', function() {
         assert.equal(treeTileViewModel.getTileMode(), 'static');
         assert.equal(treeTileViewModel.getItemsHeight(), 300);
      });

      it('prepareDisplayFilterData', function() {
         var
            filterData = treeTileViewModel.prepareDisplayFilterData();
         assert.deepEqual([], filterData.expandedItems);
         assert.deepEqual([], filterData.collapsedItems);
      });

      it('getCurrent', function() {
         var cur;
         treeTileViewModel.setHoveredItem({
            key: 2,
            zoomCoefficient: 1.5,
            position: 'string with style'
         });
         cur = treeTileViewModel.getCurrent();
         assert.isTrue(cur.isGroup);
         assert.isTrue(!!cur.beforeItemTemplate);

         treeTileViewModel.goToNext();
         cur = treeTileViewModel.getCurrent();
         assert.equal(cur.tileMode, 'static');
         assert.equal(cur.itemsHeight, 300);
         assert.equal(cur.imageProperty, 'image');
         assert.isUndefined(cur.zoomCoefficient);
         assert.isFalse(!!cur.isHovered);
         assert.isFalse(!!cur.hasSeparator);

         treeTileViewModel.goToNext();
         cur = treeTileViewModel.getCurrent();
         assert.isTrue(!!cur.isHovered);
         assert.isTrue(!!cur.beforeItemTemplate);
         assert.equal(cur.position, 'string with style');
         assert.equal(cur.zoomCoefficient, 1.5);
      });

      it('getMultiSelectClassList hidden', function() {
         treeTileViewModel._options.multiSelectVisibility = 'hidden';
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, '');
      });


      it('getMultiSelectClassList visible', function() {
         treeTileViewModel._options.multiSelectVisibility = 'visible';
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox controls-TreeTileView__checkbox js-controls-TileView__withoutZoom');
      });


      it('getMultiSelectClassList onhover selected', function() {
         treeTileViewModel._options.multiSelectVisibility = 'onhover';
         treeTileViewModel._selectedKeys = {2: true};
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox controls-TreeTileView__checkbox js-controls-TileView__withoutZoom');
         treeTileViewModel._selectedKeys = {};
      });

      it('getMultiSelectClassList onhover unselected', function() {
         treeTileViewModel._options.multiSelectVisibility = 'onhover';
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-ListView__checkbox-onhover controls-TileView__checkbox controls-TreeTileView__checkbox js-controls-TileView__withoutZoom');
      });

      it('setTileMode', function() {
         var ver = treeTileViewModel._version;
         treeTileViewModel.setTileMode('dynamic');
         assert.equal(treeTileViewModel.getTileMode(), 'dynamic');
         assert.notEqual(ver, treeTileViewModel._version);
      });

      it('setItemsHeight', function() {
         var ver = treeTileViewModel._version;
         treeTileViewModel.setItemsHeight(200);
         assert.equal(treeTileViewModel.getItemsHeight(), 200);
         assert.notEqual(ver, treeTileViewModel._version);
      });

      it('setHoveredItem', function() {
         var ver = treeTileViewModel._version;
         treeTileViewModel.setHoveredItem({key: 1});
         assert.equal(treeTileViewModel.getHoveredItem().key, 1);
         assert.notEqual(ver, treeTileViewModel._version);
      });

      it('setActiveItem', function() {
         treeTileViewModel.setHoveredItem({key: 1});
         treeTileViewModel.setActiveItem(null);
         assert.equal(treeTileViewModel.getHoveredItem(), null);
         treeTileViewModel.setHoveredItem({key: 2});
         treeTileViewModel.setActiveItem({key: 3});
         assert.equal(treeTileViewModel.getHoveredItem().key, 2);
      });

      it('setRoot', function() {
         treeTileViewModel.setHoveredItem({key: 1});
         treeTileViewModel.setRoot('root');
         assert.equal(treeTileViewModel.getHoveredItem(), null);
      });

      it('getTileItemData', function() {
         var tileItemData = treeTileViewModel.getTileItemData();
         assert.deepEqual(tileItemData, {
            defaultFolderWidth: 250,
            defaultItemWidth: 250,
            imageProperty: 'image',
            itemCompressionCoefficient: 0.7,
            itemsHeight: 200,
            defaultShadowVisibility: 'visible',
            tileMode: 'dynamic'
         });
      });
   });
});
