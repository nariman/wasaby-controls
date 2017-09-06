/**
 * Константы длительных операций
 *
 * @class SBIS3.CONTROLS.LongOperationsConst
 * @public
 */
define('js!SBIS3.CONTROLS.LongOperationsConst',
   [],

   function () {
      'use strict';

      //Конвертация в строку, так как rk может давать объект, умеющий конвертироваться в строку - для NodeJS
      return {
         // Ошибка при выгрузке страницы
         ERR_UNLOAD: '' + rk('Операция прекращена ввиду того, что пользователь покинул страницу'),

         // Вопрос пользователю при выгрузке страницы
         MSG_UNLOAD: '' + rk('Если Вы покинете эту страницу сейчас, то некоторые длительные операции не будут завершены корректно. Покинуть страницу?')
      };
   }
);
