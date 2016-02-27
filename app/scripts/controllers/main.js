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
                volume: 1.0,
                loop: true,
                env : { hold : 100000000 },
                delay   : {
                      delayTime : 0.5,  // Time in seconds between each delayed playback.
                      wet       : 0, // Relative volume change between the original sound and the first delayed playback.
                      feedback  : 0, // Relative volume change between each delayed playback and the next.
                },
                reverb  : {
                    wet     : 0,                                            // Volume of the reverberations.
                    impulse : '../sounds/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
                },
                filter  : {
                      type      : 'lowpass', // What type of filter is applied.
                      frequency : 600,       // The frequency, in hertz, to which the filter is applied.
                      q         : 1,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
                }
            });
            $scope.tracks[index].player.play();
            $scope.tracks[index].playing = true;
          }

      }

      //Effects
      $scope.masterVolume = 1.0;
      $scope.setVolume = function() {

          $scope.trackOne.volume = $scope.masterVolume;
      }

      $scope.masterSpeed = 1.0;
      $scope.setSpeed = function() {

          $scope.trackOne.soundSource.playbackRate.value = parseInt($scope.masterSpeed) / 100;
      }

      $scope.masterDelay = 0;
      $scope.setDelay = function() {

          var time = 1.5;
          var delay = parseInt($scope.masterDelay) / 100;

          //Set the value
          $scope.trackOne.delay.delayTime = time;
          $scope.trackOne.delay.wet = delay;
          $scope.trackOne.delay.feedback = delay;

          //Set the node's value
          $scope.trackOne.delay.delayNode.delayNode.delayTime.value = time;

          $scope.trackOne.delay.delayNode.feedbackNode.gain.value = delay;
          $scope.trackOne.delay.delayNode.wetNode.gain.value = delay;
      }

  }
})();
