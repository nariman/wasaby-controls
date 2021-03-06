define(
   [
      'Controls/_popupTemplate/Dialog/Opener/DialogStrategy',
      'Controls/_popupTemplate/Dialog/Opener/DialogController',
      'Controls/_popup/Opener/Dialog'
   ],
   (DialogStrategy, DialogController, DialogOpener) => {
      'use strict';


      describe('Controls/_popup/Opener/Dialog', () => {
         let sizes = {
            width: 200,
            height: 300
         };

         let windowSize = {
            width: 1920,
            height: 960
         };

         DialogController._getWindowSize = () => windowSize;

         it('Opener: getConfig', () => {
            let getDialogConfig = DialogOpener.default.prototype._getDialogConfig;
            let config = getDialogConfig();
            assert.equal(config.isDefaultOpener, true);

            config = getDialogConfig({ isDefaultOpener: false });
            assert.equal(config.isDefaultOpener, false);
         });

         it('dialog positioning base', () => {
            let windowData = {
               width: 1920,
               height: 1080,
               scrollTop: 0
            };
            let position = DialogStrategy.getPosition(windowData, sizes, { popupOptions: {} });
            assert.equal(position.top, 390);
            assert.equal(position.left, 860);

            windowData.scrollTop = 80;
            windowData.scrollLeft = 20;
            position = DialogStrategy.getPosition(windowData, sizes, { popupOptions: {} });
            assert.equal(position.top, 470);
            assert.equal(position.left, 880);

            let sizesCopy = {...sizes};
            sizesCopy.height = 2000;
            DialogStrategy.getPosition(windowData, sizesCopy, { popupOptions: {} });
            position = DialogStrategy.getPosition(windowData, sizesCopy, { popupOptions: {} });
            assert.equal(position.height, windowData.height);
         });

         it('dialog positioning overflow container', () => {
            let windowData = {
               width: 300,
               height: 300,
               scrollTop: 0
            };
            let position = DialogStrategy.getPosition(windowData, sizes, { popupOptions: {} });
            assert.equal(position.top, 0);
            assert.equal(position.left, 50);
            assert.equal(position.width, undefined);
            assert.equal(position.height, 300);
         });

         it('dialog positioning overflow popup config', () => {
            let popupOptions = {
               minWidth: 300,
               maxWidth: 600
            };
            let windowData = {
               width: 500,
               height: 500,
               scrollTop: 0
            };

            let sizesTest = { ...sizes };
            sizesTest.width = 600;

            let position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.width, 500);
         });

         it('dialog positioning overflow minWidth', () => {
            let popupOptions = {
               minWidth: 600,
               maxWidth: 700
            };
            let windowData = {
               width: 500,
               height: 500,
               scrollTop: 0
            };
            let sizesTest = { ...sizes };
            sizesTest.width = 700;
            let position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.width, 500);
         });

         it('dialog popupoptions sizes config', () => {
            let popupOptions = {
               maxWidth: 800,
               maxHeight: 800,
               minWidth: 400,
               minHeight: 400
            };
            let windowData = {
               width: 500,
               height: 500,
               scrollTop: 0
            };

            let width = 800;
            let height = 800;

            let sizesTest = { ...sizes, width, height };
            let position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.top, 0);
            assert.equal(position.width, 500);
            assert.equal(position.height, 500);
            assert.equal(position.maxWidth, 500);
            assert.equal(position.minWidth, 400);
            assert.equal(position.maxHeight, 500);
            assert.equal(position.minHeight, 400);

            popupOptions.width = 550;
            position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.width, 500);
            assert.equal(position.height, 500);
            popupOptions.height = 500;
            popupOptions.maxHeight = 400;
            position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.width, 500);
            assert.equal(position.height, 400);

            popupOptions.maximize = true;
            windowData.scrollTop = 10;
            position = DialogStrategy.getPosition(windowData, sizesTest, { popupOptions });
            assert.equal(position.left, 0);
            assert.equal(position.top, 0);
         });

         it('dialog container sizes after update', () => {
            DialogController.prepareConfig = (cfg) => {
               if (!cfg.popupOptions.width) {
                  assert.equal(container.style.width, 'auto');
               } else {
                  assert.equal(container.style.width, 10);
               }
               if (!cfg.popupOptions.height) {
                  assert.equal(container.style.height, 'auto');
               } else {
                  assert.equal(container.style.height, 10);
               }
               assert.equal(container.style.maxWidth, '20px');
               assert.equal(container.style.maxHeight, '30px');
            };
            let container = {
               style: {
                  width: 10,
                  height: 10
               }
            };
            DialogController.elementUpdated({
               popupOptions: {
                  width: 15,
                  height: 15,
                  maxWidth: 20,
                  maxHeight: 30
               }
            }, container);
            DialogController.elementUpdated({
               popupOptions: {
                  maxWidth: 20,
                  maxHeight: 30
               }
            }, container);
            assert.equal(container.style.width, 10);
            assert.equal(container.style.height, 10);
            assert.equal(container.style.maxWidth, '');
            assert.equal(container.style.maxHeight, '');
         });

         it('dialog default position', () => {
            let item = {
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            };
            DialogController.getDefaultConfig(item);
            assert.equal(item.position.maxWidth, 100);
            assert.equal(item.position.minWidth, 10);
            assert.equal(item.position.minHeight, 10);
            assert.equal(item.position.maxHeight, 100);

            DialogController._getWindowSize = () => windowSize;

            item.popupOptions = {};
            DialogController.getDefaultConfig(item);
            assert.equal(item.position.maxWidth, 1920);
            assert.equal(item.position.maxHeight, 960);
         });

         it('calc coordinates _fixCompatiblePosition', () => {
            let item = {
                  popupOptions: {
                     width: 730,
                     left: 785
                  },
                  position: {},
                  dragged: false
               },
               windowData = {
                  width: 1920,
                  height: 960,
               };

            DialogController._getWindowSize = () => windowData;
            DialogController._fixCompatiblePosition(item);
            assert.equal(item.position.left, 785);

            windowData = {
               width: 1080,
               height: 960,
            };
            DialogController._getWindowSize = () => windowData;
            DialogController._fixCompatiblePosition(item);

            let calculateLeft = item.popupOptions.left - ((item.popupOptions.left + item.popupOptions.width) - windowData.width);
            assert.equal(item.position.left, calculateLeft);
         });

         it('dialog drag start', function() {
            let item = {
               position: {
                  left: 100,
                  top: 50
               },
               sizes: {
                  width: 50,
                  height: 50
               }
            };
            let offset = {
               x: 10,
               y: 20
            };
            let basePrepareConfig = DialogController._prepareConfig;
            DialogController._prepareConfig = (item, sizes) => {
               assert.equal(item.sizes, sizes);
            };
            DialogController.popupDragStart(item, null, offset);
            assert.equal(item.startPosition.left, 100);
            assert.equal(item.startPosition.top, 50);
            assert.equal(item.position.left, 110);
            assert.equal(item.position.top, 70);
            DialogController._prepareConfig = basePrepareConfig;
         });

         it('dialog draggable position', () => {
            let itemPosition = { left: 100, top: 100 };
            let windowData = {
               width: 800,
               height: 600,
               scrollTop: 0
            };
            let position = DialogStrategy.getPosition(windowData, sizes, {
               position: itemPosition,
               dragged: true,
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            });
            assert.equal(position.left, itemPosition.left);
            assert.equal(position.top, itemPosition.top);
            assert.equal(position.maxWidth, 100);
            assert.equal(position.minWidth, 10);
            assert.equal(position.minHeight, 10);
            assert.equal(position.maxHeight, 100);

            itemPosition = {
               left: 700, top: 500, width: sizes.width, height: sizes.height
            };
            windowData = {
               width: 800,
               height: 600,
               scrollTop: 0
            };
            position = DialogStrategy.getPosition(windowData, sizes, {
               position: itemPosition,
               dragged: true,
               popupOptions: {
                  maxWidth: 100,
                  maxHeight: 100,
                  minWidth: 10,
                  minHeight: 10
               }
            });
            assert.equal(position.left, 600);
            assert.equal(position.top, 300);
            assert.equal(position.width, sizes.width); // размеры не изменились
            assert.equal(position.height, sizes.height);
            assert.equal(position.maxWidth, 100);
            assert.equal(position.minWidth, 10);
            assert.equal(position.minHeight, 10);
            assert.equal(position.maxHeight, 100);
         });
      });
   }
);
