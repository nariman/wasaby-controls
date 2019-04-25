define(
   [
      'Controls/filterPopup',
      'Controls/history',
      'Env/Env'
   ],
   function(filterPopup, history, Env) {
      describe('Filter.Button.HistoryUtils', function() {

         var historyId = 'TEST_HISTORY_ID_UTILS';

         it('getHistorySource', function() {
            var hSource = filterPopup.historyUtils.getHistorySource(historyId);
            assert.isTrue(hSource instanceof history.FilterSource);
            var hSource2 = filterPopup.historyUtils.getHistorySource(historyId);
            assert.isTrue(hSource === hSource2);
         });

         it('getHistorySource isBuildOnServer', function() {
            var isBuildOnServer = Env.constants.isBuildOnServer;
            Env.constants.isBuildOnServer = true;
            var hSource = filterPopup.historyUtils.getHistorySource(historyId);
            var hSource2 = filterPopup.historyUtils.getHistorySource(historyId);
            assert.isTrue(hSource !== hSource2);
            Env.constants.isBuildOnServer = isBuildOnServer;
         });
      });
   });
