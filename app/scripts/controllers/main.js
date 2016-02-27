(function() {
  'use strict';

  angular.module('Home', []).
  controller('MainController', ['$scope', MainController]);

  function MainController($scope) {

      //Put logic here

      //Play a sound
      $scope.playSong = function() {
          var bell = new Wad({
              source : 'file:///home/aaron/Music/test/song1.mp3',
              env : { hold : 100000000 },
              delay   : {
                delayTime : .5,  // Time in seconds between each delayed playback.
                wet       : .25, // Relative volume change between the original sound and the first delayed playback.
                feedback  : .25, // Relative volume change between each delayed playback and the next.
            }
          });
            bell.play();
            console.log(bell);
      }
  }
})();
