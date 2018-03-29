/**
 * Created by am.gerasimov on 21.02.2018.
 */
define('Controls/Filter/Button',
   [
      'Core/Control',
      'tmpl!Controls/Filter/Button/Button',
      'Core/moduleStubs',
      'WS.Data/Chain',
      'WS.Data/Utils',
      'css!Controls/Filter/Button/Button'
   ],
   
   function(Control, template, moduleStubs, Chain, Utils) {
      
      /**
       * @class Controls/Layout/Search
       * @extends Controls/Control
       * @control
       * @public
       */
      
      'use strict';
   
      var _private = {
         getFilterButtonCompatible: function(self) {
            return moduleStubs.require('Controls/Filter/Button/_FilterCompatible').addCallback(function(_FilterCompatible) {
               if (!self._filterCompatible) {
                  self._filterCompatible = new _FilterCompatible[0]({
                     filterButton: self,
                     filterButtonOptions: self._options
                  });
               }
               return self._filterCompatible;
            });
         },
   
         getText: function(items) {
            var textArr = [];
      
            Chain(items).each(function(item) {
               var textValue = Utils.getItemPropertyValue(item, 'textValue');
         
               if (textValue) {
                  textArr.push(textValue);
               }
            });
      
            return textArr.join(', ');
         },
         
         resolveItems: function(self, items) {
            self._items = items;
            self._text = _private.getText(items);
         }
      };
      
      var FilterButton = Control.extend({
         
         _template: template,
         _oldPanelOpener: null,
         _text: '',
         
         constructor: function(options) {
            FilterButton.superclass.constructor.call(this, options);
            _private.resolveItems(this, options.items);
         },
         
         _beforeUpdate: function(options) {
            if (this._options.items !== options.items) {
               _private.resolveItems(this, options.items);
            }
         },
         
         _getFilterState: function() {
            return this.isEnabled() ? 'default' : 'disabled';
         },
   
         _clearClick: function() {
            _private.getFilterButtonCompatible(this).addCallback(function(panelOpener) {
               panelOpener.clearFilter();
            });
         },
   
         _openFilterPanel: function() {
            if (this.isEnabled()) {
               /* if template - show old component */
               if (this._options.filterTemplate) {
                  _private.getFilterButtonCompatible(this).addCallback(function (panelOpener) {
                     panelOpener.showFilterPanel();
                  });
               } else {
                  //...soon
               }
            }
         }
      });
      
      FilterButton.getDefaultOptions = function() {
         return {
            filterAlign: 'right'
         };
      };
      
      return FilterButton;
   });