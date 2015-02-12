/* global module: false */
module.exports = function() {
   'use strict';

   return {
      less: {
         files: [
            'themes/**/*.less'
         ],
         tasks: ['less'],
         options: {
            spawn: false
         }
      }
   };
};