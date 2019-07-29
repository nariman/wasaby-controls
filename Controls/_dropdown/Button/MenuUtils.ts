import buttonLib = require('Controls/buttons');

   function getIconSize(options) {
      const sizes = ['small', 'medium', 'large'];
      let iconSize;
      if (options.iconSize) {
         switch (options.iconSize) {
            case 's':
               iconSize = sizes[0];
               break;
            case 'm':
               iconSize = sizes[1];
               break;
            case 'l':
               iconSize = sizes[2];
               break;
         }
      } else {
         sizes.forEach(function (size) {
            if (options.icon.indexOf('icon-' + size) !== -1) {
               iconSize = size;
            }
         });
      }
      return iconSize;
   }

   function cssStyleGeneration(options) {
      let menuStyle = options.headConfig && options.headConfig.menuStyle,
         currentButtonClass, iconSize;

      currentButtonClass = buttonLib.ActualApi.styleToViewMode(options.style);

      // для каждого размера вызывающего элемента создаем класс, который выравнивает popup через margin.
      var offsetClassName = 'controls-MenuButton_' + (currentButtonClass.viewMode || options.viewMode);

      if ((!options.icon || options.viewMode === 'toolButton')) {
         offsetClassName += ('__' + options.size);
      } else if (options.icon) {
         // у кнопки типа 'Ссылка' высота вызывающего элемента зависит от размера иконки,
         // поэтому необходимо это учесть при сдвиге
         offsetClassName += '_iconSize-' + getIconSize(options);
      }
      offsetClassName += (((menuStyle === 'duplicateHead' && options.showHeader) || (!options.headerTemplate && !options.showHeader)) ? '_duplicate' : '') + '_popup';
      return offsetClassName;
   }

   export = {
      cssStyleGeneration: cssStyleGeneration
   };

