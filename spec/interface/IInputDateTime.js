define('js!SBIS3.SPEC.interface.IInputDateTime', [
], function() {

   /**
    * Интерфейс работы текстового поля ввода даты и времени.
    * @mixin SBIS3.SPEC.interface.IInputDateTime
    * @public
    */

   /**
    * @name SBIS3.SPEC.interface.IInputDateTime#value
    * @cfg {Number} Устанавливает число.
    */

   /**
    * @event SBIS3.SPEC.interface.IInputDateTime#onValueChange Происходит при изменении числа в поле ввода.
    * @param {Number} value Число.
    */

   /**
    * @event SBIS3.SPEC.interface.IInputDateTime#onInputFinish Происходит при завершении ввода.
    * @param {Number} value Число.
    */

});