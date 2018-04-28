/**
 * Created by kraynovdo on 28.04.2018.
 */
define(
   [
      'Controls/Container/Adapter/Enum',
      'WS.Data/Type/Enum',
      'WS.Data/Query/Query'
   ],
   function(EnumContainer, EnumCtr, Query) {

      'use strict';

      var enumInstance, containerInstance;

      describe('Controls.Container.Adapter.Enum', function() {
         describe('private method', function() {
            beforeEach(function(){
               enumInstance = new EnumCtr({
                  dictionary: ['First', 'Second', 'Third'],
                  index: 1
               });
            });
            it('getArrayFromEnum', function() {
               var arr = EnumContainer._private.getArrayFromEnum(enumInstance);
               assert.deepEqual([{title : 'First'}, {title : 'Second'}, {title: 'Third'}], arr, 'getArrayFromEnum: Wrong array');
            });
            it('getSourceFromEnum', function(done) {
               var source = EnumContainer._private.getSourceFromEnum(enumInstance);
               var queryInstance = new Query();
               source.query(queryInstance).addCallback(function(dataSet){
                  var rawData = dataSet.getAll().getRawData();
                  assert.deepEqual([{title : 'First'}, {title : 'Second'}, {title: 'Third'}], rawData, 'getArrayFromEnum: Wrong source');
                  done();
               });

            });
         });
         describe('life cycle', function() {
            beforeEach(function(){
               enumInstance = new EnumCtr({
                  dictionary: ['First', 'Second', 'Third'],
                  index: 1
               });

            });
            it('enumSubscribe', function() {
               var cfg = {
                  enum: enumInstance
               };
               var containerInstance = new EnumContainer(cfg);

               EnumContainer._private.enumSubscribe(containerInstance, enumInstance);
               enumInstance.set(2);
               assert.equal('Third', containerInstance._selectedKey, 'enumSubscribe: selectedKey doesn\'t change');


            });
            it('hooks', function() {
               var cfg = {
                  enum: enumInstance
               };
               var containerInstance = new EnumContainer(cfg);
               containerInstance.saveOptions(cfg);

               containerInstance._beforeMount(cfg);
               assert.equal(enumInstance, containerInstance._enum, '_beforeMount: wrong _enum property');
               assert.equal('Second', containerInstance._selectedKey, '_beforeMount: wrong _selectedKey property');

               
               var newEnumInstance = new EnumCtr({
                  dictionary: ['Red', 'Blue', 'Yellow'],
                  index: 0
               });

               cfg = {
                  enum: newEnumInstance
               };

               containerInstance._beforeUpdate(cfg);
               assert.equal(newEnumInstance, containerInstance._enum, '_beforeUpdate: wrong _enum property');
               assert.equal('Red', containerInstance._selectedKey, '_beforeUpdate: wrong _selectedKey property');
            });
         });
      });
   }
);