define('Controls/interface/IFilterButton', [
], function() {
   
   /**
    * Provides a user interface for browsing and editing the filter fields.
    * @interface Controls/interface/IFilterButton
    * @public
    */

   /**
    * @typedef {Boolean} Visibility
    * @variant true The filter editor is located in the "Selected"
    * @variant false The filter editor is located in the "Possible to select"
    */

   /**
    * @typedef {Object} FilterPanelItems
    * @property {String} id Name of filter field
    * @property {*} value Current filter field value
    * @property {*} resetValue Value for reset
    * @property {String} textValue Text value of filter field.  Used to display a textual representation of the filter
    * @property {Visibility} visibility Defines in which block the filter editor is located. For filter editors that are never displayed in the "You can still select" section, you do not need to specify.
    */
   
   /**
    * @name Controls/interface/IFilterButton#items
    * @cfg {FilterPanelItems[]} Properties for editing or showing.
    */

   /**
    * @name Controls/interface/IFilterButton#lineSpaceTemplate
    * @cfg {Function} Template for the space between the filter button and the string.
    */
   
   /**
    * @name Controls/interface/IFilterButton#templateName
    * @cfg {String} Template for the pop-up panel. The description of the filter panel options: {@link Controls/interface/IFilterPanel}.
    */
   
   /**
    * @name Controls/interface/IFilterButton#orientation
    * @cfg {String} Sets the direction in which the popup panel will open.
    * @variant right The panel opens to the left.
    * @variant left The panel opens to the right.
    */
   
   /**
    * @event Controls/interface/IFilterButton#filterChanged Happens when filter changed.
    * @param {Core/vdom/Synchronizer/resources/SyntheticEvent} eventObject Descriptor of the event.
    * @param {Object} filter New filter.
    */

   /**
    * @event Controls/interface/IFilterButton#itemsChanged Happens when items changed.
    * @param {Core/vdom/Synchronizer/resources/SyntheticEvent} eventObject Descriptor of the event.
    * @param {Object} items New items.
    */
   
});
