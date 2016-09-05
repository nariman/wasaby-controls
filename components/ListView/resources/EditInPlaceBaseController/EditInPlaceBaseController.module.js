/**
 * Created by as.suhoruchkin on 15.10.2015.
 */

define('js!SBIS3.CONTROLS.EditInPlaceBaseController',
   [
      'js!SBIS3.CORE.CompoundControl',
      'js!SBIS3.CORE.PendingOperationProducerMixin',
      'html!SBIS3.CONTROLS.EditInPlaceBaseController/AddRowTpl',
      'js!SBIS3.CONTROLS.EditInPlace',
      'js!WS.Data/Entity/Model',
      'js!WS.Data/Entity/Record'
   ],
   function (CompoundControl, PendingOperationProducerMixin, AddRowTpl, EditInPlace, Model, Record) {

      'use strict';

      /**
       * @class SBIS3.CONTROLS.EditInPlaceBaseController
       * @extends SBIS3.CORE.CompoundControl
       * @control
       * @public
       */
      var EndEditResult = {
         CANCEL: 'Cancel',
         SAVE: 'Save',
         NOT_SAVE: 'NotSave'
      };

      var
         CONTEXT_RECORD_FIELD = 'sbis3-controls-edit-in-place',
         EditInPlaceBaseController = CompoundControl.extend([PendingOperationProducerMixin],/** @lends SBIS3.CONTROLS.EditInPlaceBaseController.prototype */ {
            $protected: {
               _options: {
                  editingTemplate: undefined,
                  getCellTemplate: undefined,
                  itemsProjection: undefined,
                  columns: undefined,
                  /**
                   * @cfg {Boolean} Завершение редактирования при потере фокуса
                   */
                  endEditByFocusOut: false,
                  /**
                   * @cfg {Boolean} Режим автоматического добавления элементов
                   * @remark
                   * Используется при включенном редактировании по месту. Позволяет при завершении редактирования последнего элемента автоматически создавать новый.
                   * @example
                   * <pre>
                   *     <option name="modeAutoAdd">true</option>
                   * </pre>
                   */
                  modeAutoAdd: false,
                  modeSingleEdit: false,
                  ignoreFirstColumn: false,
                  notEndEditClassName: undefined,
                  editFieldFocusHandler: undefined,
                  dataSource: undefined,
                  items: undefined,
                  itemsContainer: undefined,
                  getEditorOffset: undefined,
                  hierField: undefined
               },
               _eip: undefined,
               // Используется для хранения Deferred при сохранении в редактировании по месту.
               // Обязательно нужен, т.к. лишь таким способом можно обработать несколько последовательных вызовов endEdit и вернуть ожидаемый результат (Deferred).
               _savingDeferred: undefined,
               // Используется в случае, если перед редактированием запись перечитывается, и на редактирование мы отправляем запись, не свзяанную с рекордсетом,
               // и для перерисовки строки после редактирования, необходимо смержит новые данные именно в эту запись
               _editingRecord: undefined,
               _pendingOperation: undefined, // Используется для хранения операции ожидания, зарегистрированной у первого родителя с SBIS3.CORE.PendingOperationParentMixin
               //TODO: Данная переменная нужна для автодобавления по enter(mode autoadd), чтобы определить в какой папке происходит добавление элемента
               //Вариант решения проблемы не самый лучший, и добавлен как временное решение для выпуска 3.7.3.150. В версию .200 придумать нормальное решение.
               _lastTargetAdding: undefined,
               //Флаг отвечает за блокировку при добавлении записей. Если несколько раз подряд будет отправлена команда добавления, то уйдёт несколько запросов на бл
               _addLock: false,
               _addTarget: undefined
            },
            $constructor: function () {
               this._publish('onItemValueChanged', 'onBeginEdit', 'onAfterBeginEdit', 'onEndEdit', 'onBeginAdd', 'onAfterEndEdit', 'onInitEditInPlace', 'onChangeHeight');
               this._createEip();
               this._savingDeferred = $ws.proto.Deferred.success();
            },

            isEdit: function() {
               return this._eip && this._eip.isEdit();
            },

            _getEip: function() {
               if (!this._eip) {
                  this._createEip();
               }
               return this._eip;
            },

            _createEip: function() {
               this._eip = new EditInPlace(this._getEditInPlaceConfig());
            },

            setEditingTemplate: function(template) {
               this._destroyEip();
               this._options.editingTemplate = template;
               this._createEip();
            },

            getEditingTemplate: function() {
               return this._options.editingTemplate;
            },

            _getEditInPlaceConfig: function() {
               var
                  self = this,
                  config;
               config = {
                  editingTemplate: this._options.editingTemplate,
                  columns: this._options.columns,
                  element: $('<div>').prependTo(this._options.itemsContainer),
                  itemsContainer: this._options.itemsContainer,
                  getCellTemplate: this._options.getCellTemplate,
                  ignoreFirstColumn: this._options.ignoreFirstColumn,
                  context: this._getContextForEip(),
                  focusCatch: this._focusCatch.bind(this),
                  getEditorOffset: this._options.getEditorOffset,
                  parent: this,
                  handlers: {
                     onItemValueChanged: function(event, difference, model) {
                        event.setResult(self._notify('onItemValueChanged', difference, model));
                     },
                     onInit: function() {
                        self._notify('onInitEditInPlace', this);
                     },
                     onKeyPress: function(event, originalEvent) {
                        self._onKeyPress(originalEvent);
                     },
                     onChangeHeight: this._onChangeHeight.bind(this)
                  }
               };
               if (this._options.endEditByFocusOut) {
                  config.handlers.onChildFocusOut = this._onChildFocusOut.bind(this);
               }
               return config;
            },
            _onChangeHeight: function(event, model) {
               this._notify('onChangeHeight', model);
            },
            _getContextForEip: function () {
               var
                  ctx = new $ws.proto.Context({restriction: 'set'});
               ctx.subscribe('onFieldNameResolution', function (event, fieldName) {
                  var
                     record,
                     path = fieldName.split($ws.proto.Context.STRUCTURE_SEPARATOR);
                  if (path[0] !== CONTEXT_RECORD_FIELD) {
                     record = this.getValue(CONTEXT_RECORD_FIELD);
                     if (record && record.get(path[0]) !== undefined) {
                        event.setResult(CONTEXT_RECORD_FIELD + $ws.proto.Context.STRUCTURE_SEPARATOR + fieldName);
                     }
                  }
               });
               return ctx;
            },
            /**
             * Обработчик клавиатуры
             * @private
             */
            _onKeyPress: function (e) {
               var key = e.which;
               if (key === $ws._const.key.esc) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  this.endEdit(false);
               } else if (key === $ws._const.key.enter || key === $ws._const.key.down || key === $ws._const.key.up) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  this._editNextTarget(this._getCurrentTarget(), key === $ws._const.key.down || key === $ws._const.key.enter);
               }
            },
            _editNextTarget: function (currentTarget, editNextRow) {
               var
                  self = this,
                  nextTarget = this._getNextTarget(currentTarget, editNextRow);
               if (nextTarget.length && !this._options.modeSingleEdit) {
                  this.edit(this._options.items.getRecordById(nextTarget.attr('data-id'))).addCallback(function(result) {
                     if (!result) {
                        self._editNextTarget(nextTarget, editNextRow);
                     }
                  });
               // Запускаем добавление если нужно редактировать следующую строку, но строки нет и включен режим автодобавления
               // и выключен режим редактирования единичной записи (или последняя редактируемая запись на самом деле добавляется)
               } else if (editNextRow && this._options.modeAutoAdd && (!this._options.modeSingleEdit || this._getEditingEip().getEditingRecord().getState() === Record.RecordState.DETACHED)) {
                  this.add({
                     target: this._lastTargetAdding
                  });
               } else {
                  this.endEdit(true);
               }
            },
            _getNextTarget: function(currentTarget, editNextRow) {
               return currentTarget[editNextRow ? 'next' : 'prev']('.js-controls-ListView__item:not(".controls-editInPlace")');
            },
            _getCurrentTarget: function() {
               return this._eip.getTarget();
            },
            showEip: function(model, options, withoutActivateFirstControl) {
               if (options && options.isEdit) {
                  return this.edit(model, options, withoutActivateFirstControl);
               } else {
                  return this.add(options);
               }
            },
            edit: function (model, withoutActivateFirstControl) {
               var self = this;
               return this.endEdit(true).addCallback(function() {
                  return self._prepareEdit(model).addCallback(function(preparedRecord) {
                     var editingRecord;
                     if (preparedRecord) {
                        var
                            parentProjItem,
                            itemProjItem = self._options.itemsProjection.getItemBySourceItem(preparedRecord);
                        self._getEip().edit(preparedRecord, itemProjItem, withoutActivateFirstControl);
                        editingRecord = self._getEip().getEditingRecord();
                        self._notify('onAfterBeginEdit', editingRecord);
                        //TODO: необходимо разбивать контроллер редактирования по месту, для плоских и иерархических представлений
                        if (self._options.hierField) {
                           parentProjItem = itemProjItem.getParent();
                           self._lastTargetAdding = parentProjItem.isRoot() ? null : parentProjItem;
                        }
                        self._addPendingOperation();
                     }
                     return editingRecord;
                  })
               });
            },
            _prepareEdit: function(record) {
               var
                  allowEdit,
                  self = this,
                  beginEditResult,
                  loadingIndicator;
               //Если необходимо перечитывать запись перед редактированием, то делаем это
               beginEditResult = this._notify('onBeginEdit', record);
               if (beginEditResult instanceof $ws.proto.Deferred) {
                  loadingIndicator = setTimeout(function () {
                     $ws.helpers.toggleIndicator(true);
                  }, 100);
                  return beginEditResult.addCallback(function(readRecord) {
                     self._editingRecord = record;
                     //При перечитывании записи она не является связанной с рекордсетом, и мы в последствии не сможем понять,
                     //происходило ли добавление записи или редактирование. При редактировании выставим значение сами.
                     if (record.getState() !== Record.RecordState.DETACHED) {
                        readRecord.setState(Record.RecordState.UNCHANGED);
                     }
                     return readRecord;
                  }).addBoth(function (result) {
                     clearTimeout(loadingIndicator);
                     $ws.helpers.toggleIndicator(false);
                     return result;
                  });
               } else {
                  //Запрет на редактирование может быть только у существующих элементов. Если происходит добавление по месту,
                  //то не логично запрещать его. Например почти все кто использует редактирование, запрещают редактирование папок,
                  //но не нужно запрещать редактирование только что добавленных папок.
                  allowEdit = record.getState() === Record.RecordState.DETACHED || beginEditResult !== false;
                  return $ws.proto.Deferred.success(allowEdit ? record : false);
               }
            },
            /**
             * Регистрирует операцию ожидания у родителя, к которому подмешан SBIS3.CORE.PendingOperationParentMixin
             * @private
             */
            _addPendingOperation: function() {
               var
                  opener = this.getOpener();
               if (opener) {
                  this._pendingOperation = this._registerPendingOperation('EditInPlaceController', this._handlePendingOperation.bind(this), opener);
               }
            },
            /**
             * Разрегистрирует операцию ожидания у родителя, к которому подмешан SBIS3.CORE.PendingOperationParentMixin
             * @private
             */
            _removePendingOperation: function() {
               var
                  opener = this.getOpener();
               if (opener) {
                  this._unregisterPendingOperation(this._pendingOperation);
               }
            },
            /**
             * Обрабатывает операцию ожидания, пришедшую от родителя, в котором была зарегистрирована эта операция (метод _addPendingOperation)
             * @param withSave
             * @returns {*}
             * @private
             */
            _handlePendingOperation: function(withSave) {
               return this.endEdit(!!withSave);
            },
            /**
             * Завершить редактирование по месту
             * @param {Boolean} withSaving Сохранить изменения в items
             * @private
             */
            endEdit: function(withSaving) {
               var
                  record,
                  endEditResult,
                  self = this,
                  eip = this._getEditingEip();
               //При начале редактирования строки(если до этого так же что-то редактировалось), данный метод вызывается два раза:
               //первый по уходу фокуса с предидущей строки, второй при начале редактирования новой строки. Если второй вызов метода
               //произойдёт раньше чем завершится первый, то мы два раза попытаемся завершить редактирование, что ведёт к 2 запросам
               //на сохранения записи. Чтобы это предотвратить добавим проверку на то, что сейчас уже идёт сохранение(this._savingDeferred.isReady())
               if (eip && this._savingDeferred.isReady()) {
                  this._savingDeferred = new $ws.proto.Deferred();
                  record = eip.getEditingRecord();
                  endEditResult = this._notify('onEndEdit', record, withSaving);
                  if (endEditResult instanceof $ws.proto.Deferred) {
                     return endEditResult.addBoth(function(result) {
                        result = endEditResult.isSuccessful() ? result : EndEditResult.CANCEL;
                        return self._endEdit(eip, withSaving, result);
                     });
                  } else {
                     return this._endEdit(eip, withSaving, endEditResult);
                  }
               }
               //TODO: Надо обсудить c Витей, почему в стрельнувшем Deferred и если результат тоже был Deferred - нельзя делать addCallback.
               return this._savingDeferred.isReady() ? $ws.proto.Deferred.success() : this._savingDeferred;
            },
            _endEdit: function(eip, withSaving, endEditResult) {
               //TODO: Поддержка старого варианта результата.
               if (typeof endEditResult === "boolean") {
                  endEditResult = endEditResult ? EndEditResult.SAVE : EndEditResult.NOT_SAVE;
                  $ws.single.ioc.resolve('ILogger').log('onEndEdit', 'Boolean result is deprecated. Use constants EditInPlaceBaseController.EndEditResult.');
               }

               if (endEditResult) {
                  withSaving = endEditResult === EndEditResult.SAVE;
               }

               if (endEditResult === EndEditResult.CANCEL || !eip.validate() && withSaving) {
                  this._savingDeferred.errback();
                  return $ws.proto.Deferred.fail();
               } else {
                  this._updateModel(eip, withSaving);
                  return this._savingDeferred;
               }
            },
            _getEditingEip: function() {
               return this._eip.isEdit() ? this._eip : null;
            },
            _updateModel: function(eip, withSaving) {
               var
                  self = this,
                  eipRecord = eip.getEditingRecord(),
                  isAdd = eipRecord.getState() === Record.RecordState.DETACHED;
               if (withSaving) {
                  this._options.dataSource.update(eipRecord).addCallback(function() {
                     eip.acceptChanges();
                     if (self._editingRecord) {
                        self._editingRecord.merge(eipRecord);
                        self._editingRecord = undefined;
                     }
                     if (isAdd) {
                        self._options.items.push(eip._cloneWithFormat(eipRecord, self._options.items));
                     }
                  }).addErrback(function(error) {
                     $ws.helpers.alert(error);
                  }).addBoth(function() {
                     self._afterEndEdit(eip, withSaving);
                  });
               } else {
                  if (isAdd && eipRecord.getId()) {
                     this._options.dataSource.destroy(eipRecord.getId());
                  }
                  this._afterEndEdit(eip, withSaving);
               }
               this._removePendingOperation();
            },
            _afterEndEdit: function(eip, withSaving) {
               eip.endEdit();
               if (this._addTarget) {
                  this._addTarget.remove();
                  this._addTarget = undefined;
               }
               this._notify('onAfterEndEdit', eip.getOriginalRecord(), eip.getTarget(), withSaving);
               if (!this._savingDeferred.isReady()) {
                  this._savingDeferred.callback();
               }
            },
            add: function(options) {
               var
                   self = this,
                   modelOptions = options.model || this._notify('onBeginAdd');
               this._lastTargetAdding = options.target;
               return this.endEdit(true).addCallback(function() {
                  return self._createModel(modelOptions).addCallback(function (createdModel) {
                     return self._prepareEdit(createdModel).addCallback(function(model) {
                        if (self._options.hierField) {
                           model.set(self._options.hierField, options.target ? options.target.getContents().getId() : options.target);
                        }
                        self._createAddTarget(model, options);
                        self._getEip().edit(model);
                        self._notify('onAfterBeginEdit', model);
                        self._addPendingOperation();
                        return model;
                     });
                  });
               });
            },
            _createModel: function(modelOptions) {
               var self = this;
               if (this._addLock) {
                  return $ws.proto.Deferred.fail();
               } else {
                  this._addLock = true;
                  return this._options.dataSource.create(modelOptions).addBoth(function(model) {
                     self._addLock = false;
                     return model;
                  });
               }
            },
            _createAddTarget: function(model, options) {
               var
                   lastTarget,
                   currentTarget,
                   targetHash = options.target ? options.target.getHash() : null,
                   addTarget = $(AddRowTpl({
                      model: model,
                      columns: this._options.columns,
                      ignoreFirstColumn: this._options.ignoreFirstColumn
                   }));

               if (targetHash) {
                  currentTarget = $('.controls-ListView__item[data-hash="' + targetHash + '"]', this._options.itemsContainer.get(0));
                  if (options.addPosition !== 'top') {
                     while (currentTarget.length) {
                        lastTarget = currentTarget;
                        currentTarget = $('.controls-ListView__item[data-parent-hash="' + currentTarget.data('hash') + '"]', this._options.itemsContainer.get(0)).last();
                     }
                  }
                  addTarget.insertAfter(lastTarget || currentTarget);
               } else {
                  addTarget[options.addPosition === 'top' ? 'prependTo': 'appendTo'](this._options.itemsContainer);
               }
               this._addTarget = addTarget;
            },
            /**
             * Обработчик потери фокуса областью редактирования по месту
             * @param event
             * @private
             */
            _focusCatch: function (event) {
               if (event.which === $ws._const.key.tab) {
                  this._editNextTarget(this._getCurrentTarget(), !event.shiftKey);
               }
            },
            _onChildFocusOut: function (event, control) {
               var
                  eip,
                  withSaving,
                  // Если фокус ушел на кнопку закрытия диалога, то редактирование по месту не должно реагировать на это, т.к.
                  // его и так завершат через finishChildPendingOperation (и туда попадет правильный аргумент - с сохранением
                  // или без завершать редактирование по месту)
                  endEdit = !$ws.helpers.instanceOfModule(control, 'SBIS3.CORE.CloseButton') && this._allowEndEdit(control) && (this._isAnotherTarget(control, this) || this._isCurrentTarget(control));
               if (endEdit) {
                  eip = this._getEditingEip();
                  withSaving = eip.getEditingRecord().isChanged();
                  this.endEdit(withSaving);
               }
            },
            _allowEndEdit: function(control) {
               return !control.getContainer().closest('.' + this._options.notEndEditClassName).length;
            },
            /**
             * Функция проверки, куда был переведен фокус
             * @param target
             * @param control
             * @returns {boolean} Возвращает true, если фокус переведен на компонент, не являющийся дочерним элементом родителя редактирования по месту.
             * @private
             */
            _isAnotherTarget: function(target, control) {
               do {
                  target = target.getParent() || target.getOpener();
               }
               while (target && target !== control);
               return target !== control;
            },
            _isCurrentTarget: function(control) {
               var currentTarget = this._getEditingEip().getTarget(),
                   newTarget  = control.getContainer().closest('.js-controls-ListView__item');
               return currentTarget.attr('data-id') == newTarget.attr('data-id');
            },
            _destroyEip: function() {
               if (this._eip) {
                  this.endEdit();
                  this._eip.destroy();
                  this._eip = null;
               }
            },
            destroy: function() {
               this._destroyEip();
               //destroy может позваться из reload у ListView, а если в данный момент происходит сохранение, то
               //возможно после сохранения начнётся редактирование следующей строки(если сохранение запущенно по enter),
               //а редакторы уже уничтожены. В такой ситуации тем кто ждёт сохранение, скажем что его не нужно ждать.
               //Сохранение при этом продолжит работать в обычном режиме.
               if (!this._savingDeferred.isReady()) {
                  this._savingDeferred.errback();
               }
               EditInPlaceBaseController.superclass.destroy.apply(this, arguments);
            }
         });

      EditInPlaceBaseController.EndEditResult = EndEditResult;

      return EditInPlaceBaseController;
   });