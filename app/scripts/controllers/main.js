(function() {
  'use strict';

  angular.module('Home', []).
  controller('MainController', ['$scope', MainController]);

  function MainController($scope) {

      var path = require('path');

      //Put logic here
      var remote = require('remote');
      var dialog = remote.require('dialog');

      //Our files
      $scope.tracks = [];

      //Open a file
      $scope.openFile = function() {
          dialog.showOpenDialog({ properties: [ 'openFile']}, function(fileName) {
              fileName = String(fileName);
              //Check if fileName is a file or directory.
              var isFile = fileName.match(/.*\..../g);
              if(isFile){
                var title = path.basename(fileName);
                $scope.tracks.push({"uri": fileName, "title": title});
              } else {
                var dir = fs.readdirSync(fileName);
                for(var i=0;i<dir.length;i++){
                  var title = path.basename(dir[i]);
                  $scope.tracks.push({"uri": dir[i], "title": title});
                }
              }
              $scope.$apply();
          });
      }

      //Play a sound
      $scope.playSong = function(index) {
          console.log($scope.tracks);
          $scope.tracks[index].player = new Wad({
              source : 'file://' + $scope.tracks[index].uri,
              env : { hold : 100000000 },
              delay   : {
                delayTime : 0,  // Time in seconds between each delayed playback.
                wet       : .25, // Relative volume change between the original sound and the first delayed playback.
                feedback  : .25, // Relative volume change between each delayed playback and the next.
            }
          });
          $scope.tracks[index].player.play();
          $scope.tracks[index].playing = true;
      }
  }
})();
