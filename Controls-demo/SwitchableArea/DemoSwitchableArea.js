define('Controls-demo/SwitchableArea/DemoSwitchableArea', [
   'Core/Control',
   'wml!Controls-demo/SwitchableArea/DemoSwitchableArea',
   'WS.Data/Collection/RecordSet',
   'Controls/Application/HeadDataContext',
   'wml!Controls-demo/SwitchableArea/resources/content',
   'wml!Controls-demo/SwitchableArea/resources/content2',
   'wml!Controls-demo/SwitchableArea/resources/content3',
   'css!Controls-demo/SwitchableArea/DemoSwitchableArea'
], function(Control,
            template,
            RecordSet,
            HeadDataContext
) {
   'use strict';
   var items = new RecordSet({
      rawData: [
         {
            id: '1',
            title: 'content1',
            itemTemplate: 'wml!Controls-demo/SwitchableArea/resources/content'
         },
         {
            id: '2',
            title: 'content2',
            itemTemplate: 'wml!Controls-demo/SwitchableArea/resources/content2'
         },
         {
            id: '3',
            title: 'content3',
            itemTemplate: 'wml!Controls-demo/SwitchableArea/resources/content3'
         }
      ],
      idProperty: 'id'
   });

   var demoSwitchableArea = Control.extend({
      _template: template,
      _demoSelectedKey: '1',
      _items: items,
      constructor: function() {
         demoSwitchableArea.superclass.constructor.apply(this, arguments);
         this.headDataCtxField = new HeadDataContext();
      },
      _getChildContext: function() {
         return {
            headData: this.headDataCtxField
         };
      },
      clickHandler: function(event, idButton) {
         this._demoSelectedKey = idButton;
      }
   });
   return demoSwitchableArea;
});
