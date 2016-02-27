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

      //Open a file
      $scope.openFile = function() {
          dialog.showOpenDialog({ properties: [ 'openFile']}, function(fileName) {

              //Save our file url
              $scope.trackOneFileUrl = fileName;
          });
      }

      //Play a sound
      $scope.playSong = function() {

          $scope.trackOne = new Wad({
              source : 'file://' + $scope.trackOneFileUrl,
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
                  impulse : '../../reverb/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
              },
              filter  : {
                    type      : 'lowpass', // What type of filter is applied.
                    frequency : 600,       // The frequency, in hertz, to which the filter is applied.
                    q         : 1,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
              },
          });
            $scope.trackOne.play();

            console.log($scope.trackOne);

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
