/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource',
   'Env/Env',
   'Browser/Transport'
], function(
   dataSource,
   { constants }
) {
   describe('Controls/dataSource:error.Popup', () => {
      const Popup = dataSource.error.Popup;
      const fakeModules = [
         ['FakePopupModule1', () => ({
            name: 'FakePopupModule1',
            Confirmation: {
               openPopup: sinon.stub()
            },
            Dialog: {
               openPopup: sinon.stub()
            }
         })],
         ['FakePopupModule2', () => ({ name: 'FakePopupModule2' })],
         ['FakePopupModule3', () => ({ name: 'FakePopupModule3' })],
         ['FakePopupModule4', () => ({ name: 'FakePopupModule4' })]
      ];
      const fakeModuleNames = fakeModules.map(([name]) => name);
      const defineModule = ([name, definition]) => define(name, [], definition);
      const undefModule = ([name]) => require.undef(name);
      const importThemes = modules => new Promise((resolve, reject) => {
         require(modules, (...args) => resolve(args), reject);
      });

      let originalModules;
      let originalThemes;
      let originalImportThemes;

      beforeEach(() => {
         originalModules = Popup.POPUP_MODULES;
         originalThemes = Popup.POPUP_THEMES;
         originalImportThemes = Popup.importThemes;
         Popup.importThemes = importThemes;
         fakeModules.forEach(defineModule);
      });

      afterEach(() => {
         fakeModules.forEach(undefModule);
         Popup.POPUP_MODULES = originalModules;
         Popup.POPUP_THEMES = originalThemes;
         Popup.importThemes = originalImportThemes;
         sinon.restore();
      });

      describe('preloadPopup()', () => {
         it('loads default modules', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0], fakeModuleNames[1]];
            Popup.POPUP_THEMES = [fakeModuleNames[2], fakeModuleNames[3]];
            const p = new Popup();
            return p.preloadPopup().then((result) => {
               assert.strictEqual(result.name, fakeModuleNames[0]);
            });
         });

         it('loads additional modules', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            Popup.POPUP_THEMES = [fakeModuleNames[1]];
            const p = new Popup([fakeModuleNames[2]], [fakeModuleNames[3]]);
            return p.preloadPopup().then((result) => {
               assert.strictEqual(result.name, fakeModuleNames[0]);
            });
         });

         it('result fulfilled with undefined', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            Popup.POPUP_THEMES = ['FakeFailModule1'];
            const p = new Popup();
            return p.preloadPopup().then((result) => {
               assert.isUndefined(result);
            });
         });
      });

      describe('openConfirmation()', () => {
         it('calls openPopup()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            Popup.POPUP_THEMES = [fakeModuleNames[1]];
            const p = new Popup();
            const options = {};
            return p.openConfirmation(options).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isTrue(
                  popup.Confirmation.openPopup.calledOnce,
                  'openPopup() called'
               );
               assert.strictEqual(
                  popup.Confirmation.openPopup.getCall(0).args[0],
                  options,
                  'openPopup() called with options'
               );
            });
         });

         it('calls showDefaultDialog()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            Popup.POPUP_THEMES = ['FakeFailModule1'];
            const p = new Popup();
            sinon.stub(Popup, 'showDefaultDialog');
            const options = { message: 'test' };
            return p.openConfirmation(options).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isNotOk(
                  popup.Confirmation.openPopup.called,
                  'openPopup() should not be called'
               );
               assert.isTrue(
                  Popup.showDefaultDialog.calledOnce,
                  'showDefaultDialog() called'
               );
               assert.strictEqual(
                  Popup.showDefaultDialog.getCall(0).args[0],
                  options.message,
                  'showDefaultDialog() called with message'
               );
            });
         });
      });

      describe('openDialog()', () => {
         it('calls openPopup()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            Popup.POPUP_THEMES = [fakeModuleNames[1]];
            const p = new Popup();
            const config = {
               template: {},
               options: {}
            };
            const opener = {};
            return p.openDialog(config, opener).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isTrue(popup.Dialog.openPopup.calledOnce, 'openPopup() called');
               const cfg = popup.Dialog.openPopup.getCall(0).args[0];
               assert.strictEqual(cfg.template, config.template, 'openPopup() called with template');
               assert.strictEqual(cfg.options, config.templateOptions, 'openPopup() called with options');
               assert.strictEqual(cfg.opener, opener, 'openPopup() called with opener');
            });
         });

         it('calls showDefaultDialog()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            Popup.POPUP_THEMES = ['FakeFailModule1'];
            const p = new Popup();
            sinon.stub(Popup, 'showDefaultDialog');
            const config = {
               options: {
                  message: 'message',
                  details: 'details'
               }
            };
            return p.openDialog(config).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isNotOk(popup.Dialog.openPopup.called, 'openPopup() should not be called');
               assert.isTrue(Popup.showDefaultDialog.calledOnce, 'showDefaultDialog() called');
               assert.deepEqual(
                  Popup.showDefaultDialog.getCall(0).args,
                  [config.options.message, config.options.details],
                  'showDefaultDialog() called with message and details'
               );
            });
         });
      });

      describe('showDefaultDialog()', () => {
         const globalObject = typeof global !== 'undefined'
            ? global
            : typeof window !== 'undefined'
               ? window
               : {};
         const originalIsBrowser = constants.isBrowserPlatform;
         const originalAlert = globalObject.alert;

         beforeEach(() => {
            globalObject.alert = sinon.stub();
         });

         afterEach(() => {
            constants.isBrowserPlatform = originalIsBrowser;
            globalObject.alert = originalAlert;
         });

         it('does nothing on server side', () => {
            if (originalIsBrowser) {
               this.skip();
            }

            Popup.showDefaultDialog();
            assert.isNotOk(globalObject.alert.called);
         });

         it('calls alert with message', () => {
            constants.isBrowserPlatform = true;
            const message = 'message';
            Popup.showDefaultDialog(message);
            assert.isTrue(globalObject.alert.calledOnceWith(message));
         });

         it('calls alert with message and details', () => {
            constants.isBrowserPlatform = true;
            const message = 'message';
            const details = 'details';
            Popup.showDefaultDialog(message, details);
            assert.isTrue(globalObject.alert.calledOnceWith(`${message}\n${details}`));
         });
      });
   });
});