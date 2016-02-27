(function() {
  'use strict';

  angular.module('Home', []).
  controller('MainController', ['$scope', MainController]);

  function MainController($scope) {

      var path = require('path');
      var fs = require('fs');

      //Put logic here
      var remote = require('remote');
      var dialog = remote.require('dialog');

      //Our files
      $scope.tracks = [];

      //Open a file
      $scope.openFile = function() {
          dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory' ]}, function(fileName) {
              fileName = String(fileName);
              //Check if fileName is a file or directory.
              var isFile = fileName.match(/.*\..../g);
              if(isFile){
                var title = path.basename(fileName);
                $scope.tracks.push({"uri": fileName, "title": title});
              } else {
                var dir = fs.readdirSync(fileName);
                for(var i=0;i<dir.length;i++){
                  var forwardSlash = fileName.match(/\//g);
                  var fullPath;
                  if(forwardSlash){
                    var fullPath = fileName + "/" + String(dir[i]);
                  } else {
                    var fullPath = fileName + "\\" + String(dir[i]);
                  }
                  var title = path.basename(dir[i]);
                  $scope.tracks.push({"uri": fullPath, "title": title});
                }
              }
              $scope.$apply();
          });
      }

      //Play/stop a track
      $scope.toggleTrack = function(index) {
          //Check if track is currently playing
          if($scope.tracks[index].playing){
            //Stop song playing
            $scope.tracks[index].player.stop();
            $scope.tracks[index].playing = false;
            $scope.tracks[index].player = null;
          } else {
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
  }
})();
