/* global:object define:function, beforeEach:function, afterEach:function, describe:function, context:function, it:function, assert:function, $ws:object */
define([
      'js!SBIS3.CONTROLS.LongOperationsManager',
      'js!SBIS3.CONTROLS.GenericLongOperationsProducer',
      'js!SBIS3.CONTROLS.ILongOperationsProducer',
      'Core/core-extend',
      'js!WS.Data/Entity/ObservableMixin'
   ],

   function (longOperationsManager, GenericLongOperationsProducer, ILongOperationsProducer, CoreExtend, ObservableMixin) {
      'use strict';

      mocha.setup({/*ignoreLeaks:true,*/ globals:[/*'*',*/ '__extends', 'sharedBusDebug', 'sharedBusLog']});


      describe('LongOperations: LongOperationsManager', function () {

         // Создадим пустой продюсер для проверки добавления
         define('js!SomeLeftProducer', [], function () {
            var SomeLeftProducer = CoreExtend.extend({}, [ILongOperationsProducer, ObservableMixin], {
               getName: function () { return 'SomeLeftProducer'; },
               hasCrossTabEvents: function () {},
               hasCrossTabData: function () {},
               fetch: function () {},
               callAction: function () {},
               subscribe: function () {},
               unsubscribe: function () {},
               canDestroySafely: function () { return true; },
               destroy: function () {}
            });
            require('Core/constants').jsModules['SomeLeftProducer'] = 'Какой-то путь...';
            return new SomeLeftProducer();
         });


         describe('Экземпляр и API', function () {
            assert.isObject(longOperationsManager);
            var signatures = {
               register: 1,
               isRegistered: 1,
               getByName: 1,
               unregister: 1,
               fetch: 1,
               callAction: 4,
               canHasHistory: 2,
               history: 5,
               subscribe: 3,
               unsubscribe: 3,
               canDestroySafely: 0,
               destroy: 0
            };
            Object.keys(signatures).forEach(function (method) {
               var len = signatures[method];
               it('Метод экземпляра ' + method + ' (' + len + ')', function () {
                  var f = longOperationsManager[method];
                  assert.isFunction(f, 'Метод отсутствует');
                  if (typeof f === 'function') {
                     assert.equal(f.length, len, 'Количество аргументов');
                  }
               });
            });
         });


         describe('Метод register - Зарегистрировать продюсер длительных операций', function () {
            it('Аргумент producer не может быть числом', function () {
               assert.throws(function () {
                  longOperationsManager.register(1);
               });
            }, Error);

            it('Аргумент producer не может быть строкой', function () {
               assert.throws(function () {
                  longOperationsManager.register('Что-то');
               });
            }, Error);

            it('Аргумент producer не может быть простым объектом', function () {
               assert.throws(function () {
                  longOperationsManager.register({'что-то':'здесь'});
               });
            }, Error);

            it('Аргумент producer не может быть объектом, просто воспроизводящим сигнатуру SBIS3.CONTROLS.ILongOperationsProducer', function () {
               assert.throws(function () {
                  longOperationsManager.register({
                     getName: function () { return 'SomeLeftProducer'; },
                     hasCrossTabEvents: function () {},
                     hasCrossTabData: function () {},
                     fetch: function () {},
                     callAction: function () {},
                     subscribe: function () {},
                     unsubscribe: function () {},
                     canDestroySafely: function () {},
                     destroy: function () {}
                  });
               }, Error);
            });

            it('Аргумент producer должен быть экземпляром класса, реализующего интерфейс SBIS3.CONTROLS.ILongOperationsProducer (1)', function () {
               var p1 = new GenericLongOperationsProducer();
               var p2 = new GenericLongOperationsProducer('Второй');
               var p3 = new GenericLongOperationsProducer('Третий');
               assert.doesNotThrow(function () {
                  longOperationsManager.register(p1);
                  longOperationsManager.register(p2);
                  longOperationsManager.register(p3);
               }, Error);
            });

            it('Аргумент producer должен быть экземпляром класса, реализующего интерфейс SBIS3.CONTROLS.ILongOperationsProducer (2)', function (done) {
               require(['js!SomeLeftProducer'], function (someLeftProducer) {
                  try {
                     assert.doesNotThrow(function () {
                        longOperationsManager.register(someLeftProducer);
                     }, Error);
                     done();
                  }
                  catch (err) {
                     done(err);
                  }
               });
            });
         });


         describe('Метод isRegistered - Выяснить, зарегистрирован ли указанный продюсер длительных операций', function () {
            it('Аргумент producer не может быть числом', function () {
               assert.throws(function () {
                  longOperationsManager.isRegistered(1);
               });
            }, Error);

            it('Аргумент producer не может быть быть пустой строкой', function () {
               assert.throws(function () {
                  longOperationsManager.isRegistered('');
               });
            }, Error);

            it('Аргумент producer не может быть простым объектом', function () {
               assert.throws(function () {
                  longOperationsManager.isRegistered({'что-то':'здесь'});
               });
            }, Error);

            it('Аргумент producer не может быть объектом, просто воспроизводящим сигнатуру SBIS3.CONTROLS.ILongOperationsProducer', function () {
               assert.throws(function () {
                  longOperationsManager.isRegistered({
                     getName: function () { return 'SomeLeftProducer'; },
                     hasCrossTabEvents: function () {},
                     hasCrossTabData: function () {},
                     fetch: function () {},
                     callAction: function () {},
                     subscribe: function () {},
                     unsubscribe: function () {},
                     canDestroySafely: function () {},
                     destroy: function () {}
                  });
               }, Error);
            });

            it('Аргумент producer или может быть строкой', function () {
               assert.doesNotThrow(function () {
                  longOperationsManager.isRegistered('Что-то');
               });
            }, Error);

            it('Аргумент producer или может быть экземпляром класса, реализующего интерфейс SBIS3.CONTROLS.ILongOperationsProducer', function () {
               var p1 = GenericLongOperationsProducer.getInstance();
               var p2 = GenericLongOperationsProducer.getInstance('Второй');
               var p3 = GenericLongOperationsProducer.getInstance('Третий');
               assert.doesNotThrow(function () {
                  longOperationsManager.isRegistered(p1);
                  longOperationsManager.isRegistered(p2);
                  longOperationsManager.isRegistered(p3);
               }, Error);
            });


            it('Возвращаются правильные значения', function (done) {
               try {
                  assert.isTrue(longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer'));
                  assert.isTrue(longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй'));
                  assert.isTrue(longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий'));
                  assert.isNotOk(longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Не зарегистрированный'));
                  var p1 = GenericLongOperationsProducer.getInstance();
                  var p2 = GenericLongOperationsProducer.getInstance('Второй');
                  var p3 = GenericLongOperationsProducer.getInstance('Третий');
                  var p4 = GenericLongOperationsProducer.getInstance('Не зарегистрированный');
                  assert.isTrue(longOperationsManager.isRegistered(p1));
                  assert.isTrue(longOperationsManager.isRegistered(p2));
                  assert.isTrue(longOperationsManager.isRegistered(p3));
                  assert.isNotOk(longOperationsManager.isRegistered(p4));
                  require(['js!SomeLeftProducer'], function (someLeftProducer) {
                     try {
                        assert.isTrue(longOperationsManager.isRegistered(someLeftProducer));
                        done();
                     }
                     catch (ex2) {
                        done(ex2);
                     }
                  });
               }
               catch (err) {
                  done(err);
               }
            });
         });


         describe('Метод getByName - Получить зарегистрированный продюсер длительных операций по его имени', function () {
            it('Аргумент prodName не может быть числом', function () {
               assert.throws(function () {
                  longOperationsManager.getByName(1);
               });
            }, Error);

            it('Аргумент prodName не может быть быть пустой строкой', function () {
               assert.throws(function () {
                  longOperationsManager.getByName('');
               });
            }, Error);

            it('Аргумент prodName не может быть простым объектом', function () {
               assert.throws(function () {
                  longOperationsManager.getByName({'что-то':'здесь'});
               });
            }, Error);

            it('Аргумент prodName или может быть экземпляром класса, реализующего интерфейс SBIS3.CONTROLS.ILongOperationsProducer', function () {
               var p1 = GenericLongOperationsProducer.getInstance();
               assert.throws(function () {
                  longOperationsManager.getByName(p1);
               }, Error);
            });

            it('Аргумент prodName должен быть строкой', function () {
               assert.doesNotThrow(function () {
                  longOperationsManager.getByName('Что-то');
               });
            }, Error);


            it('Возвращаются правильные значения', function (done) {
               try {
                  var p1 = GenericLongOperationsProducer.getInstance();
                  var p2 = GenericLongOperationsProducer.getInstance('Второй');
                  var p3 = GenericLongOperationsProducer.getInstance('Третий');
                  assert.strictEqual(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer'), p1);
                  assert.strictEqual(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй'), p2);
                  assert.strictEqual(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий'), p3);
                  assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Не зарегистрированный'));
                  require(['js!SomeLeftProducer'], function (someLeftProducer) {
                     try {
                        assert.strictEqual(longOperationsManager.getByName('SomeLeftProducer'), someLeftProducer);
                        done();
                     }
                     catch (ex2) {
                        done(ex2);
                     }
                  });
               }
               catch (err) {
                  done(err);
               }
            });
         });


         describe('Метод unregister - Удалить продюсер длительных операций из списка зарегистрированных', function () {
            it('Аргумент producer не может быть числом', function () {
               assert.throws(function () {
                  longOperationsManager.unregister(1);
               });
            }, Error);

            it('Аргумент producer не может быть быть пустой строкой', function () {
               assert.throws(function () {
                  longOperationsManager.unregister('');
               });
            }, Error);

            it('Аргумент producer не может быть простым объектом', function () {
               assert.throws(function () {
                  longOperationsManager.unregister({'что-то':'здесь'});
               });
            }, Error);

            it('Аргумент producer не может быть объектом, просто воспроизводящим сигнатуру SBIS3.CONTROLS.ILongOperationsProducer', function () {
               assert.throws(function () {
                  longOperationsManager.unregister({
                     getName: function () { return 'SomeLeftProducer'; },
                     hasCrossTabEvents: function () {},
                     hasCrossTabData: function () {},
                     fetch: function () {},
                     callAction: function () {},
                     subscribe: function () {},
                     unsubscribe: function () {},
                     canDestroySafely: function () {},
                     destroy: function () {}
                  });
               }, Error);
            });

            it('Аргумент producer или может быть строкой', function () {
               assert.doesNotThrow(function () {
                  longOperationsManager.unregister('Что-то');
               });
            }, Error);

            it('Аргумент producer или может быть экземпляром класса, реализующего интерфейс SBIS3.CONTROLS.ILongOperationsProducer', function () {
               var p4 = GenericLongOperationsProducer.getInstance('Не зарегистрированный');
               assert.doesNotThrow(function () {
                  longOperationsManager.unregister(p4);
               }, Error);
            });


            it('После вызова удалённые продюсеры действительно отсутствуют', function (done) {
               try {
                  var p2 = GenericLongOperationsProducer.getInstance('Второй');
                  var p3 = GenericLongOperationsProducer.getInstance('Третий');
                  assert.doesNotThrow(function () {
                     longOperationsManager.unregister('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй');
                     longOperationsManager.unregister(p3);
                  }, Error);
                  assert.isNotOk(longOperationsManager.isRegistered(p2));
                  assert.isNotOk(longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий'));
                  assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй'));
                  assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий'));
                  require(['js!SomeLeftProducer'], function (someLeftProducer) {
                     try {
                        assert.doesNotThrow(function () {
                           assert.isTrue(longOperationsManager.unregister(someLeftProducer));
                        }, Error);
                        assert.isNotOk(longOperationsManager.isRegistered(someLeftProducer));
                        assert.isUndefined(longOperationsManager.getByName('SomeLeftProducer'));
                        done();
                     }
                     catch (ex2) {
                        done(ex2);
                     }
                  });
               }
               catch (err) {
                  done(err);
               }
            });
         });


         /*describe('Метод fetch - Запросить набор последних длительных операций из всех зарегистрированных продюсеров', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод callAction - Запросить указанный продюсер выполнить указанное действие с указанным элементом', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод canHasHistory - Проверить, поддерживается ли история длительных операций указанным продюсером', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод history - Запросить историю указанной длительной операции', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод subscribe - Подписаться на получение события', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод unsubscribe - Отписаться от получения события', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод canDestroySafely - Проверить, можно ли в данный момент ликвидировать экземпляр класса без необратимой потери данных', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         /*describe('Метод destroy - Ликвидировать экземпляр класса', function () {
            it('000', function () {
               //^^^Реализовать
            });
         });*/


         describe('Метод register - После ликвидации экземпляра', function () {
            it('При попытке обратиться с допустимыми аргументами не будет выброшена ошибка', function () {
               longOperationsManager.destroy();
               var latecomer = new GenericLongOperationsProducer('Опоздавший');
               assert.doesNotThrow(function () {
                  longOperationsManager.register(latecomer);
               });
            }, Error);
         });


         describe('Метод isRegistered - После ликвидации экземпляра', function () {
            it('При попытке обратитьься с допустимыми аргументами не будет выброшена ошибка', function () {
               longOperationsManager.destroy();
               var p1 = GenericLongOperationsProducer.getInstance();
               var p2 = GenericLongOperationsProducer.getInstance('Второй');
               var p3 = GenericLongOperationsProducer.getInstance('Третий');
               var p4 = GenericLongOperationsProducer.getInstance('Не зарегистрированный');
               assert.doesNotThrow(function () {
                  longOperationsManager.isRegistered(p1);
                  longOperationsManager.isRegistered(p2);
                  longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer');
                  longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй');
                  longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий');
                  longOperationsManager.isRegistered('SBIS3.CONTROLS.GenericLongOperationsProducer:Не зарегистрированный');
                  longOperationsManager.isRegistered(p3);
                  longOperationsManager.isRegistered(p4);
               });
            }, Error);

            it('При попытке обратитьься с допустимыми аргументами не будет возвращено никакое значение', function () {
               longOperationsManager.destroy();
               var p1 = GenericLongOperationsProducer.getInstance();
               var p2 = GenericLongOperationsProducer.getInstance('Второй');
               var p3 = GenericLongOperationsProducer.getInstance('Третий');
               var p4 = GenericLongOperationsProducer.getInstance('Не зарегистрированный');
               assert.isUndefined(longOperationsManager.isRegistered(p1));
               assert.isUndefined(longOperationsManager.isRegistered(p2));
               assert.isUndefined(longOperationsManager.isRegistered(p3));
               assert.isUndefined(longOperationsManager.isRegistered(p4));
            });
         });


         describe('Метод getByName - После ликвидации экземпляра', function () {
            it('При попытке обратитьься с допустимыми аргументами не будет выброшена ошибка', function () {
               longOperationsManager.destroy();
               assert.doesNotThrow(function () {
                  longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer');
                  longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй');
                  longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий');
                  longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Не зарегистрированный');
               });
            }, Error);

            it('При попытке обратитьься с допустимыми аргументами не будет возвращено никакое значение', function () {
               longOperationsManager.destroy();
               assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer'));
               assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй'));
               assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий'));
               assert.isUndefined(longOperationsManager.getByName('SBIS3.CONTROLS.GenericLongOperationsProducer:Не зарегистрированный'));
            });
         });


         describe('Метод unregister - После ликвидации экземпляра', function () {
            it('При попытке обратитьься с допустимыми аргументами не будет выброшена ошибка', function () {
               longOperationsManager.destroy();
               var p1 = GenericLongOperationsProducer.getInstance();
               var p2 = GenericLongOperationsProducer.getInstance('Второй');
               var p3 = GenericLongOperationsProducer.getInstance('Третий');
               var p4 = GenericLongOperationsProducer.getInstance('Не зарегистрированный');
               assert.doesNotThrow(function () {
                  longOperationsManager.unregister(p1);
                  longOperationsManager.unregister(p2);
                  longOperationsManager.unregister('SBIS3.CONTROLS.GenericLongOperationsProducer');
                  longOperationsManager.unregister('SBIS3.CONTROLS.GenericLongOperationsProducer:Второй');
                  longOperationsManager.unregister('SBIS3.CONTROLS.GenericLongOperationsProducer:Третий');
                  longOperationsManager.unregister('SBIS3.CONTROLS.GenericLongOperationsProducer:Не зарегистрированный');
                  longOperationsManager.unregister(p3);
                  longOperationsManager.unregister(p4);
               });
            }, Error);
         });


         /*describe('Метод fetch - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод callAction - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод canHasHistory - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод history - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод subscribe - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод unsubscribe - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод canDestroySafely - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


         /*describe('Метод destroy - После ликвидации экземпляра', function () {
            it('000', function () {
               longOperationsManager.destroy();
               //^^^Реализовать
            });
         });*/


      });
   }
);
