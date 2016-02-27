(function() {
  'use strict';

  angular.module('Home', []).
  controller('MainController', ['$scope', MainController]);

  function MainController($scope) {

      //Put logic here
      var remote = require('remote');
      var dialog = remote.require('dialog');

      //Our file
      $scope.trackOneFileUrl;

      $scope.tracks = [];

      //Open a file
      $scope.openFile = function() {
          dialog.showOpenDialog({ properties: [ 'openFile']}, function(fileName) {
              //Check if fileName is a file or directory.
              var isFile = str.match(/.*\..../g);
              if(isFile){
                $scope.tracks.push(fileName);
              } else {
                var dir = fs.readdirSync(path);
                for(var i=0;i<dir.length;i++){
                  $scope.tracks.push(dir[i]);
                }
              }
          });
      }

      //Play a sound
      $scope.playSong = function() {

          $scope.trackOne = new Wad({
              source : 'file://' + $scope.trackOneFileUrl,
              env : { hold : 100000000 },
              delay   : {
                delayTime : 0,  // Time in seconds between each delayed playback.
                wet       : .25, // Relative volume change between the original sound and the first delayed playback.
                feedback  : .25, // Relative volume change between each delayed playback and the next.
            }
          });
            $scope.trackOne.play();
      }
  }
})();
