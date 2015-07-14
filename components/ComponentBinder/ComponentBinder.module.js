define('js!SBIS3.CONTROLS.ComponentBinder', [], function () {
   /**
    * Контроллер для осуществления базового взаимодействия между компонентами.
    *
    * @class SBIS3.CONTROLS.ComponentBinder
    * @extends $ws.proto.Abstract
    * @public
    */
   /*методы для поиска*/
   function startSearch(text, gridView, BreadCrumbs, searchParamName) {
      if (text) {
         var filter = $ws.core.merge(gridView._filter, {
            'Разворот': 'С разворотом',
            'usePages': 'full'
         });
         filter[searchParamName] = text;
         gridView.setHighlightText(text, false);
         gridView.setInfiniteScroll(true, true);
         gridView.setGroupBy(gridView.getSearchGroupBy());
         gridView._container.addClass('controls-GridView__searchMode');
         if (this._firstSearch) {
            this._lastRoot = gridView.getCurrentRoot();
            this._pathDSRawData = $ws.core.clone(BreadCrumbs.getDataSet().getRawData());
         }
         this._firstSearch = false;
         this._searchReload = true;
         // TODO нафиг это надо
         BreadCrumbs.setItems([]);

         gridView.reload(filter, gridView._sorting, 0);
      }
   }
   function resetGroup(gridView, searchParamName, BreadCrumbs) {
      //Если мы ничего не искали, то и сбрасывать нечего
      if (this._firstSearch) {
         return;
      }
      var filter = $ws.core.merge(gridView._filter, {
         'Разворот' : 'Без разворота'
      });
      delete (filter[searchParamName]);

      gridView.setInfiniteScroll(false, true);
      gridView.setGroupBy({});
      gridView.setHighlightText('', false);
      gridView._container.removeClass('controls-GridView__searchMode');
      this._firstSearch = true;
      if (this._searchReload ) {
         //Нужно поменять фильтр и загрузить нужный корень.
         //TODO менять фильтр в контексте, когда появятся data-binding'и
         filter[gridView.getHierField()] = this._lastRoot;
         //DataGridView._filter = filter;
         //DataGridView.setCurrentRoot(self._lastRoot); - плохо, потому что ВСЕ крошки на странице получат изменения
         gridView.reload(filter, gridView._sorting, 0);
         BreadCrumbs.getDataSet().setRawData(this._pathDSRawData);
         BreadCrumbs._redraw();
      } else {
         //Очищаем крошки. TODO переделать, когда появятся привзяки по контексту
         gridView._filter = filter;
      }
   }

   function breakSearch(searchForm){
      this._searchReload = false;
      this._firstSearch = true;
      //Если в строке поиска что-то есть, очистим и сбросим Фильтр
      if (searchForm.getText()) {
         searchForm.setText('');
      }
   }

   function isSearchValid(text, minLength) {
      var checkText = text.replace(/[«»’”@#№$%^&*;:?.,!\/~\]\[{}()|<>=+\-_\s'"]/g, '');
      return [checkText, checkText.length >= minLength];
   }

   function toggleCheckBoxes(operationPanel, gridView) {
      if (gridView._options.hideCheckBoxes && gridView._options.multiselect) {
         gridView._container.toggleClass('controls-DataGridView__showCheckBoxes', operationPanel.isOpen())
            .toggleClass('controls-DataGridView__hideCheckBoxes', !operationPanel.isOpen());
      }
   }
   /**
    * Контроллер, позволяющий связывать компоненты осуществляя базовое взаимодейтсие между ними
    * @author Крайнов Дмитрий
    * @class SBIS3.CONTROLS.ComponentBinder
    * @extends $ws.proto.Abstract
    * @public
    */
   var ComponentBinder = $ws.proto.Abstract.extend({
      $protected : {
         _searchReload : true,
         _searchForm : undefined,
         _lastRoot : undefined,
         _currentRoot: null,
         _pathDSRawData : undefined,
         _firstSearch: true,
         _lastViewMode: null,
         _path: []
      },

      /**
       * Метод для связывания формы строки поиска с представлением данных
       * @param searchForm объект формы поиска
       * @param gridView объект представления данных
       * @param BreadCrumbs объект хлебных крошек
       * @param searchParamName параметр фильтрации для поиска
       * @example
       * <pre>
       *     myBinder = new ComponentBinder();
       *     myBinder.bindSearchGrid(searchForm, gridView, BreadCrumbs, searchParamName);
       * </pre>
       */
      bindSearchGrid : function(searchForm, gridView, BreadCrumbs, searchParamName) {
         var self = this;
         this._lastRoot = gridView.getCurrentRoot();
         searchForm.subscribe('onTextChange', function(event, text){
            var checkedText = isSearchValid(text, 3);
            if (checkedText[1]) {
               startSearch.call(self, this.getText(), gridView, BreadCrumbs, searchParamName);
               self._path = [];
               self._currentRoot = null;
            }
            if (!checkedText[0]) {
               resetGroup.call(self, gridView, searchParamName, BreadCrumbs);
            }
         });

         searchForm.subscribe('onSearchStart', function(event, text) {
            var checkedText = isSearchValid(text, 1);
            if (checkedText[1]) {
               startSearch.call(self, this.getText(), gridView, searchParamName);
            }
         });
         //searchForm.subscribe('onReset', resetGroup);
         gridView.subscribe('onSetRoot', function(){
            breakSearch(searchForm);
         });
         //Перед переключением в крошках в режиме поиска сбросим фильтр поиска
         gridView.subscribe('onSearchPathClick', function(){
            breakSearch(searchForm);
         });
      },
      bindSearchComposite: function(searchForm, compositeView, BreadCrumbs, searchParamName) {
         this.bindSearchGrid.apply(this, arguments);
         /*var self = this;
         compositeView.subscribe('onDataLoad', function(){
            if (searchForm.getText().length > 2) {
               self._lastViewMode = this.getViewMode();
               this.setViewMode('table');
            } else if (self._lastViewMode) {
               this.setViewMode(self._lastViewMode);
            }
         });*/
      },

      /**
       * Метод для связывания хлебных крошек с представлением данных
       * @param breadCrumbs объект хлебных крошек
       * @param backButton объект книпоки назад
       * @param hierarchyGridView объект представления данных
       * @example
       * <pre>
       *     myBinder = new ComponentBinder();
       *     myBinder.bindSearchGrid(searchForm, gridView, BreadCrumbs, searchParamName);
       * </pre>
       */
      bindBreadCrumbs: function(breadCrumbs, backButton, hierarchyGridView){
         var self = this;

         function createBreadCrumb(data){
            var point = {};
            point[breadCrumbs._options.displayField] = $ws.helpers.escapeHtml(data.title);
            point[breadCrumbs._options.keyField] = data.id;
            point[breadCrumbs._options.colorField] = data.color;
            point.data = data.data;
            return point;
         }

         function setPreviousRoot() {
            var previousRoot = self._path[self._path.length - 1];

            if(self._currentRoot !== null) {
               self._currentRoot = previousRoot;
               if (self._path.length) self._path.splice(self._path.length - 1);
               hierarchyGridView.setCurrentRoot(previousRoot ? previousRoot[breadCrumbs._options.keyField] : null);
            }
         }

         hierarchyGridView.subscribe('onSetRoot', function(event, id, hier){
            for (var i = hier.length - 1; i >= 0; i--) {
               var rec = hier[i];
               if (rec){
                  var c = createBreadCrumb(rec);
                  if (self._currentRoot) self._path.push(self._currentRoot);
                  self._currentRoot = c;
               }
            }

            for (i = 0; i < self._path.length; i++){
               if (self._path[i].id == id) {
                  self._path.splice(i);
                  break;
               }
            }

            breadCrumbs._toggleHomeIcon(!self._currentRoot);
            breadCrumbs.setItems(self._path);
            backButton.setCaption(self._currentRoot ? $ws.helpers.escapeHtml(self._currentRoot.title) : '');
         });

         hierarchyGridView.subscribe('onKeyPressed', function(event, jqEvent) {
            if(jqEvent.which === $ws._const.key.backspace) {
               setPreviousRoot();
               jqEvent.preventDefault();
            }
         });

         breadCrumbs.subscribe('onItemClick', function(event, id){
               self._currentRoot = this._dataSet.getRecordByKey(id);
               self._currentRoot = self._currentRoot ? self._currentRoot.getRaw() : null;
            if (id === null){
               self._path = [];
            }
            this.setItems(self._path);
            hierarchyGridView.setCurrentRoot(id);
            this._toggleHomeIcon(!self._path.length);
         });

         backButton.subscribe('onActivated', function(){
            setPreviousRoot();
         });
      },
      bindOperationPanel: function(operationPanel, gridView) {
         operationPanel._addItemOptions = function(options) {
            options.linkedView = gridView;
         };
         toggleCheckBoxes(operationPanel, gridView);
         gridView.subscribe('onSelectedItemsChange', function(event, idArray) {
            operationPanel.setPanelState(idArray.length);
         });
         operationPanel.subscribe('onToggle', function() {
            toggleCheckBoxes(operationPanel, gridView);
         });
      }
   });

   return ComponentBinder;
});
