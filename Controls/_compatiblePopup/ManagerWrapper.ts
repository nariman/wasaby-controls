/**
 * Created by as.krasilnikov on 29.10.2018.
 */

import Control = require('Core/Control');
import Controller from 'Controls/Popup/Compatible/ManagerWrapper/Controller';
import template = require('wml!Controls/_compatiblePopup/ManagerWrapper/ManagerWrapper');
import {Controller as ControllerPopup} from 'Controls/popup';
import {setController, IPopupSettingsController} from 'Controls/Application/SettingsController';
import { SyntheticEvent } from 'Vdom/Vdom';
import {Bus} from 'Env/Event';

var ManagerWrapper = Control.extend({
   _template: template,

   _beforeMount: function() {
      // TODO: https://online.sbis.ru/opendoc.html?guid=3f08c72a-8ee2-4068-9f9e-74b34331e595
      this._loadViewSettingsController();
   },

   _afterMount: function() {
      Controller.registerManager(this);

      // Add handlers to events when children are created
      this._scrollPage = this._eventRegistratorHandler.bind(this, 'scrollDetect');
      this._resizePage = this._eventRegistratorHandler.bind(this, 'resizeDetect');
      this._mousemovePage = this._eventRegistratorHandler.bind(this, 'mousemoveDetect');
      this._touchmovePage = this._eventRegistratorHandler.bind(this, 'touchmoveDetect');
      this._touchendPage = this._eventRegistratorHandler.bind(this, 'touchendDetect');
      this._mousedownPage = this._mouseDownHandler.bind(this);
      this._mouseupPage = this._eventRegistratorHandler.bind(this, 'mouseupDetect');

      this._toggleWindowHandlers(true);
   },

   _loadViewSettingsController: function() {
      const isBilling = document.body.classList.contains('billing-page');
      // Совместимость есть на онлайне и в биллинге. В биллинге нет ViewSettings и движения границ
      if (!isBilling) {
         // Для совместимости, временно, пока не решат проблемыв с ViewSettings делаю локальное хранилище.
         // todo: https://online.sbis.ru/opendoc.html?guid=3f08c72a-8ee2-4068-9f9e-74b34331e595
         const localController: IPopupSettingsController = {
            getSettings(ids) {
               const storage = window && JSON.parse(window.localStorage.getItem('controlSettingsStorage')) || {};
               const data = {};

               if (ids instanceof Array) {
                  ids.map((id: string) => {
                     if (storage[id]) {
                        data[id] = storage[id];
                     }
                  });
               }
               return Promise.resolve(data);
            },
            setSettings(settings) {
               const storage = window && JSON.parse(window.localStorage.getItem('controlSettingsStorage')) || {};
               if (typeof settings === 'object') {
                  const savedData = {...storage, ...settings};
                  window.localStorage.setItem('controlSettingsStorage', JSON.stringify(savedData));
               }
            }
         };
         setController(localController);
      }
      return Promise.resolve();
   },

   _beforePopupDestroyedHandler: function() {
      // Контрол ловим событие и вызывает обработчик в GlobalPopup.
      // На текущий момент у PopupGlobal нет возможности самому ловить событие.
      var PopupGlobal = this._children.PopupGlobal;
      PopupGlobal._popupBeforeDestroyedHandler.apply(PopupGlobal, arguments);
   },

   _toggleWindowHandlers: function(subscribe) {
      var actionName = subscribe ? 'addEventListener' : 'removeEventListener';
      window[actionName]('scroll', this._scrollPage);
      window[actionName]('resize', this._resizePage);
      window[actionName]('mousemove', this._mousemovePage);
      window[actionName]('touchmove', this._touchmovePage);
      window[actionName]('touchend', this._touchendPage);
      window[actionName]('mousedown', this._mousedownPage);
      window[actionName]('mouseup', this._mouseupPage);
   },

   startResizeEmitter(event: Event): void {
      // запустим перепозиционирование вдомных окон (инициатор _onResizeHandler в слое совместимости)
      // Не запускаем только для подсказки, т.к. она на апдейт закрывается
      if (!this._destroyed) {
         this._resizePage(event);
         // защита на случай если не подмешалась совместимость
         if (this._children.PopupContainer.getChildControls) {
            const popups = this._children.PopupContainer.getChildControls(null, false, (instance) => {
               return instance._moduleName === 'Controls/_popup/Manager/Popup' && instance._options.template !== 'Controls/popupTemplate:templateInfoBox';
            });
            if (popups && popups.map) {
               popups.map((popup) => {
                  // На всякий случай если фильтр вернет не то
                  if (popup._controlResizeOuterHandler) {
                     popup._controlResizeOuterHandler();
                  }
               });
            }
         }
      }
   },

   _eventRegistratorHandler: function(registratorName, event) {
      // vdom control used synthetic event
      this._children[registratorName].start(new SyntheticEvent(event));
   },

   _mouseDownHandler: function(event) {
      this._eventRegistratorHandler('mousedownDetect', event);
      var Manager = ControllerPopup.getManager();
      if (Manager) {
         Manager._mouseDownHandler(event);
      }
   },

   registerListener: function(event, registerType, component, callback) {
      this._listenersSubscribe('_registerIt', event, registerType, component, callback);
   },

   unregisterListener: function(event, registerType, component, callback) {
      this._listenersSubscribe('_unRegisterIt', event, registerType, component, callback);
   },

   _listenersSubscribe: function(method, event, registerType, component, callback) {
      if (!this._destroyed) {
         // Вызываю обработчики всех регистраторов, регистратор сам поймет, нужно ли обрабатывать событие
         var registrators = [
            'scrollDetect',
            'resizeDetect',
            'mousemoveDetect',
            'touchmoveDetect',
            'touchendDetect',
            'mousedownDetect',
            'mouseupDetect'
         ];
         for (var i = 0; i < registrators.length; i++) {
            this._children[registrators[i]][method](event, registerType, component, callback);
         }
      }
   },

   _scrollHandler: function(scrollContainer) {
      if (!this._destroyed) {
         this.closePopups(scrollContainer);
      }
   },

   _documentDragStart: function() {
      Bus.globalChannel().notify('_compoundDragStart');
   },

   _documentDragEnd: function() {
      Bus.globalChannel().notify('_compoundDragEnd');
   },

   closePopups: function(scrollContainer) {
      const items = this.getItems().clone();

      items.forEach((item) => {
         // Если попап не следует за таргетом при скролле - закроем его.
         // Избавимся только когда сделают задачу, описанную комментом выше
         if (item.popupOptions.actionOnScroll === 'close' && $(scrollContainer).find(item.popupOptions.target).length) {
            this._children.Manager.remove(item.id);
         }
      });
   },

   getMaxZIndex(): number {
      const items = this.getItems();
      let maxZIndex = 0;
      items.each((item) => {
         if (item.currentZIndex > maxZIndex && !item.popupOptions.topPopup) {
            maxZIndex = item.currentZIndex;
         }
      });
      return maxZIndex;
   },

   getItems: function() {
      return this._children.PopupContainer._popupItems;
   },

   _beforeUnmount: function() {
      if (window) {
         this._toggleWindowHandlers(false);
      }
   }

});

export default ManagerWrapper;
