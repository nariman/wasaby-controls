define([
   'Controls/FormController',
   'Core/Deferred',
   'Types/entity',
   'Core/polyfill/PromiseAPIDeferred'
], (FormController, Deferred, entity) => {
   'use strict';

   describe('FormController', () => {
      it('initializingWay', (done) => {
         let FC = new FormController();

         let baseReadRecordBeforeMount = FormController._private.readRecordBeforeMount;
         let baseCreateRecordBeforeMount = FormController._private.createRecordBeforeMount;
         let cfg = {
            record: new entity.Record(),
         };

         let isReading = false;
         let isCreating = false;

         FormController._private.readRecordBeforeMount = () => {
            isReading = true;
            return Promise.resolve({ data: true });
         };

         FormController._private.createRecordBeforeMount = () => {
            isCreating = true;
            return Promise.resolve({ data: true });
         };

         let p1 = new Promise((resolve) => {
            let beforeMountResult = FC._beforeMount(cfg);
            assert.equal(isReading, false);
            assert.equal(isCreating, false);
            assert.notEqual(beforeMountResult, true);
            resolve();
         });

         let p2 = new Promise((resolve) => {
            cfg.key = '123';
            let beforeMountResult = FC._beforeMount(cfg);
            assert.equal(isReading, true);
            assert.equal(isCreating, false);
            assert.isTrue(
               beforeMountResult instanceof Deferred ||
               beforeMountResult instanceof Promise
            );
               beforeMountResult.then(({data}) => {
                  assert.equal(data, true);
                  resolve();
            });
         });

         let p3 = new Promise((resolve) => {
            cfg = {
               key: 123
            };
            isReading = false;
            let beforeMountResult = FC._beforeMount(cfg);
            assert.equal(isReading, true);
            assert.equal(isCreating, false);
            assert.isTrue(
               beforeMountResult instanceof Deferred ||
               beforeMountResult instanceof Promise
            );
            beforeMountResult.then(({data}) => {
               assert.equal(data, true);
               resolve();
            });
         });
         let p4 = new Promise((resolve) => {
            isReading = false;
            isCreating = false;
            let beforeMountResult = FC._beforeMount({});
            assert.equal(isReading, false);
            assert.equal(isCreating, true);
            assert.isTrue(
               beforeMountResult instanceof Deferred ||
               beforeMountResult instanceof Promise
            );
            beforeMountResult.then(({data}) => {
               assert.equal(data, true);
               resolve();
            });
         });

         Promise.all([p1, p2, p3, p4]).then(() => {
            FormController._private.readRecordBeforeMount = baseReadRecordBeforeMount;
            FormController._private.createRecordBeforeMount = baseCreateRecordBeforeMount;
            FC.destroy();
            done();
         });
      });

      it('beforeUpdate', () => {
         let FC = new FormController();
         let setRecordCalled = false;
         let readCalled = false;
         let createCalled = false;

         FC._setRecord = () => {
            setRecordCalled = true;
         };
         FC.read = () => {
            readCalled = true;
         };
         FC.create = () => {
            createCalled = true;
         };

         FC._beforeUpdate({
            record: 'record'
         });
         assert.equal(setRecordCalled, true);
         assert.equal(readCalled, false);
         assert.equal(createCalled, false);

         setRecordCalled = false;
         FC._beforeUpdate({
            record: {
               isChanged: () => false
            },
            key: 'key'
         });

         assert.equal(setRecordCalled, true);
         assert.equal(readCalled, true);
         assert.equal(createCalled, false);
         assert.equal(FC._isNewRecord, false);

         setRecordCalled = false;
         readCalled = false;
         FC._beforeUpdate({
            isNewRecord: true
         });

         assert.equal(setRecordCalled, false);
         assert.equal(readCalled, false);
         assert.equal(createCalled, true);

         createCalled = false;
         let updateCalled = false;
         let confirmPopupCalled = false;
         FC._showConfirmPopup = () => {
            confirmPopupCalled = true;
            return (new Deferred()).callback(true);
         };
         FC.update = () => {
            updateCalled = true;
            return (new Deferred()).callback();
         };
         let record = {
            isChanged: () => true
         };
         FC._options.record = record;
         FC._beforeUpdate({
            record: record,
            key: 'key'
         });

         assert.equal(setRecordCalled, false);
         assert.equal(confirmPopupCalled, true);
         assert.equal(readCalled, true);
         assert.equal(updateCalled, true);
         assert.equal(createCalled, false);

         FC._showConfirmPopup = () => {
            confirmPopupCalled = true;
            return (new Deferred()).callback(false);
         };

         updateCalled = false;
         readCalled = false;
         confirmPopupCalled = false;
         FC._beforeUpdate({
            record: record,
            key: 'key'
         });

         assert.equal(setRecordCalled, false);
         assert.equal(confirmPopupCalled, true);
         assert.equal(readCalled, true);
         assert.equal(updateCalled, false);
         assert.equal(createCalled, false);

         FC.destroy();
      });

      it('beforeUnmount', () => {
         let FC = new FormController();
         let isRecordUnsubscribe = false;
         FC._record = {
            unsubscribe: () => {
               isRecordUnsubscribe = true;
            }
         };
         FC._beforeUnmount();
         assert.equal(isRecordUnsubscribe, true);
         FC.destroy();
      });

      it('delete new record', () => {
         let FC = new FormController();
         let isDestroyCalled = false;
         FC._options.dataSource = {
            destroy: () => {
               isDestroyCalled = true;
            }
         };
         FC._tryDeleteNewRecord();
         assert.equal(isDestroyCalled, false);

         FC._record = {
            getId: () => null
         };
         FC._isNewRecord = true;

         FC._tryDeleteNewRecord();
         assert.equal(isDestroyCalled, false);

         FC._record = {
            getId: () => 'key'
         };
         FC._tryDeleteNewRecord();
         assert.equal(isDestroyCalled, true);

         FC.destroy();
      });
   });
});
