define('js!SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace', [
   'js!SBIS3.CORE.CompoundControl',
   'html!SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace',
   'js!SBIS3.CONTROLS.DataGridView',
   'js!SBIS3.CONTROLS.Data.Source.Memory',
   'js!SBIS3.CONTROLS.Demo.FieldLinkDataSource',
   'js!SBIS3.CONTROLS.Data.Collection.RecordSet',
   'js!SBIS3.CONTROLS.Data.Adapter.Sbis',
   'css!SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace',
   'js!SBIS3.CONTROLS.TextBox',
   'js!SBIS3.CONTROLS.FieldLink',
   'js!SBIS3.CORE.CoreValidators',
   'html!SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace/resources/cellWorkPlace',
   'html!SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace/resources/cellFIO',
   'html!SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace/resources/cellID'
], function (CompoundControl, dotTplFn, DataGridView, StaticSource, FieldLinkDataSource, DataSet, AdapterSbis) {
   /**
    * SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace
    * @class SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace
    * @extends $ws.proto.CompoundControl
    * @control
    */
   var moduleClass = CompoundControl.extend(/** @lends SBIS3.CONTROLS.Demo.FieldLinkWithEditInPlace.prototype */{
      _dotTplFn: dotTplFn,
      $protected: {
         _dataGrid: null
      },

      $constructor: function() {
         $ws.single.CommandDispatcher.declareCommand(this, 'newItem', this._newItem.bind(this));
      },

      init: function () {
         moduleClass.superclass.init.call(this);
         this._dataGrid = this.getChildControlByName('DemoDataGrid');
         this._dataGrid.setDataSource(this._createDataGridSource());
         this._dataGrid.sendCommand('newItem');
      },

      _newItem: function() {
         return this._dataGrid.sendCommand('newItem');
      },

      _createDataGridSource: function () {
         return new FieldLinkDataSource({
            data: {
               _type: 'recordset',
               d: [
                  [1, 'Иванов Федор Иванович',
                     {
                        _type: 'record',
                        d: [
                           {
                              _type: 'recordset',
                              d: [
                                 [0, 'ООО Тензор'],
                                 [1, 'ОАО РЖД']
                              ],
                              s: [
                                 {n: 'Ид', t: 'ЧислоЦелое'},
                                 {n: 'Название', t: 'Текст'}
                              ],
                              keyField: 'Ид'
                           },
                           {
                              _type: 'recordset',
                              d: [
                                 [0, 'Инженер-программист'],
                                 [1, 'Руководитель группы']
                              ],
                              s: [
                                 {n: 'Ид', t: 'ЧислоЦелое'},
                                 {n: 'Название', t: 'Текст'}
                              ],
                              keyField: 'Ид'
                           }
                        ],
                        s: [
                           {n: 'Компания', t: 'Выборка'},
                           {n: 'Должность', t: 'Выборка'}
                        ]
                     }
                  ],
                  [2, 'Прыткова Ирина Борисовна',
                     {
                        _type: 'record',
                        d: [
                           {
                              _type: 'recordset',
                              d: [
                                 [0, 'ООО Тензор']
                              ],
                              s: [
                                 {n: 'Ид', t: 'ЧислоЦелое'},
                                 {n: 'Название', t: 'Текст'}
                              ],
                              keyField: 'Ид'
                           },
                           {
                              _type: 'recordset',
                              d: [
                                 [2, 'Менеджер']
                              ],
                              s: [
                                 {n: 'Ид', t: 'ЧислоЦелое'},
                                 {n: 'Название', t: 'Текст'}
                              ],
                              keyField: 'Ид'
                           }
                        ],
                        s: [
                           {n: 'Компания', t: 'Выборка'},
                           {n: 'Должность', t: 'Выборка'}
                        ]
                     }
                  ],
                  [3, 'Шойгу Сергей Кужугетович',
                     {
                        _type: 'record',
                        d: [
                           {
                              _type: 'recordset',
                              d: [
                                 [2, 'Правительство РФ']
                              ],
                              s: [
                                 {n: 'Ид', t: 'ЧислоЦелое'},
                                 {n: 'Название', t: 'Текст'}
                              ],
                              keyField: 'Ид'
                           },
                           {
                              _type: 'recordset',
                              d: [
                                 [3, 'Генерал армии'],
                                 [4, 'Министр обороны']
                              ],
                              s: [
                                 {n: 'Ид', t: 'ЧислоЦелое'},
                                 {n: 'Название', t: 'Текст'}
                              ],
                              keyField: 'Ид'
                           }
                        ],
                        s: [
                           {n: 'Компания', t: 'Выборка'},
                           {n: 'Должность', t: 'Выборка'}
                        ]
                     }
                  ]
               ],
               s: [{n: 'Ид', t: 'ЧислоЦелое'},
                  {n: 'ФИО', t: 'Текст'},
                  {n: 'МестоРаботы', t: 'Запись'}]
            },
            keyField: 'Ид',
            adapter: new AdapterSbis()
         });
      },

      initFiledLink1: function () {
         this.setDataSource(new StaticSource({
            data: {
               _type: 'recordset',
               d: [
                  [0, 'ООО Тензор'],
                  [1, 'ОАО РЖД'],
                  [2, 'Правительство РФ'],
                  [3, 'НПО Весёлый шарик']
               ],
               s: [
                  {n: 'Ид', t: 'ЧислоЦелое'},
                  {n: 'Название', t: 'Текст'}
               ]
            },
            idProperty: 'Ид',
            adapter: new AdapterSbis()
         }));
         this.setDataSourceFilter(retTrue);
      },

      initFiledLink2: function () {
         this.setDataSource(new StaticSource({
            data: {
               _type: 'recordset',
               d: [
                  [0, 'Инженер-программист'],
                  [1, 'Руководитель группы'],
                  [2, 'Менеджер'],
                  [3, 'Генерал армии'],
                  [4, 'Министр обороны'],
                  [5, 'Бухгалтер']
               ],
               s: [
                  {n: 'Ид', t: 'ЧислоЦелое'},
                  {n: 'Название', t: 'Текст'}
               ]
            },
            idProperty: 'Ид',
            adapter: new AdapterSbis()
         }));
         this.setDataSourceFilter(retTrue);
      },
      initFiledLink3: function () {
         this.setDataSource(new StaticSource({
            data: {
               _type: 'recordset',
               d: [
                  [0, 'Инженер-программист'],
                  [1, 'Руководитель группы'],
                  [2, 'Менеджер'],
                  [3, 'Генерал армии'],
                  [4, 'Министр обороны'],
                  [5, 'Бухгалтер']
               ],
               s: [
                  {n: 'Ид', t: 'ЧислоЦелое'},
                  {n: 'Название', t: 'Текст'}
               ]
            },
            idProperty: 'Ид',
            adapter: new AdapterSbis()
         }));
         this.setDataSourceFilter(retTrue);
         this.setSelectedKeys([1,2,3]);
      }
   });
   return moduleClass;
});