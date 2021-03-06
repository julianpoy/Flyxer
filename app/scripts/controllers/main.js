(function() {
  'use strict';

  angular.module('Home', ['ngAnimate']).
  controller('MainController', ['$scope', MainController]);

  function MainController($scope) {

      //Our node requirements
      var path = require('path');
      var fs = require('fs');
      var dirTree = require('directory-tree');
      var remote = require('remote');
      var dialog = remote.require('dialog');

      //Set up tuna node style for Wad :)
      var Tuna = require("../../dist/vendor/tuna-min.js");
      window.Tuna = Tuna;

      //Our files
      $scope.tracks = [];

      $scope.directory = {};
      $scope.directoryRoot = "";

      //Our default track height
      var defaultTrackHeight = 175;

      //Check if the user has used the app before
      var hasUsed = localStorage.getItem("tutorial");
      if(!hasUsed) $scope.showTutorial = true;

      $scope.setTutorial = function(setBool) {

          if(!setBool) localStorage.setItem("tutorial", true);

          $scope.showTutorial = setBool;
      }

      $scope.openDir = function(){
        dialog.showOpenDialog({ properties: [ 'openDirectory' ]}, function(fileName) {
          $scope.directoryRoot = fileName[0];
          $scope.directory = dirTree.directoryTree(fileName[0]);
          //console.log($scope.directory);
          $scope.$apply();
          setTimeout(function(){
            $scope.$apply();
          }, 600);
        });
      }

      $scope.addTrack = function(fileName){
        var forwardSlash = $scope.directoryRoot.match(/\//g);
        var slash;
        if(forwardSlash){
          slash = "/";
        } else {
          slash = "\\";
        }
        fileName = $scope.directoryRoot + slash + fileName;
        var title = path.basename(fileName);
        $scope.tracks.push({"uri": fileName, "title": title, "playbackSpeed": 100});

        //Set playing to false
        $scope.tracks[$scope.tracks.length - 1].playing = false;

        //Also save the tracks volume here for the ng model slider
        $scope.tracks[$scope.tracks.length - 1].playbackVolume = 100;

        //Also save the height of the track for preety animations
        $scope.tracks[$scope.tracks.length - 1].cardHeight = {'height': defaultTrackHeight + 'px'};
      }

      $scope.removeTrack = function(index){
        if($scope.tracks[index].playing) $scope.toggleTrack(index);
        $scope.tracks.splice(index, 1);

        //Make sure that selected track index for our slider showing is reset
         $scope.trackFader = -1;
      }

      $scope.restartTrack = function(index){
        if($scope.tracks[index].playing){
          $scope.toggleTrack(index);
          $scope.toggleTrack(index);
        }
      }

      //Play/stop a track
      $scope.toggleTrack = function(index) {

          //Check if track is currently playing
          if($scope.tracks[index].playing){
            //Stop song playing
            $scope.tracks[index].player.stop();
            $scope.tracks[index].playing = false;
            $scope.tracks[index].player = null;

            //Also shorten it's view
            $scope.toggleTrackFader(false, index);
          } else {
            $scope.tracks[index].player = new Wad({
                source : 'file://' + $scope.tracks[index].uri,
                volume: 1.0,
                wait    : 0,
                loop: true,
                env : { hold : 100000000 },
                delay   : {
                      delayTime : 0.5,  // Time in seconds between each delayed playback.
                      wet : 0, // Relative volume change between the original sound and the first delayed playback.
                      feedback : 0, // Relative volume change between each delayed playback and the next.
                },
                reverb  : {
                    wet : 0,  // Volume of the reverberations.
                    impulse : '../sounds/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
                },
                filter  : {
                      type : 'lowpass', // What type of filter is applied.
                      frequency : 4000,       // The frequency, in hertz, to which the filter is applied.
                      q : 1,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
                },
                tuna   : {
                    Bitcrusher : {
                        bits: 16,          //1 to 16
                        normfreq: 1,    //0 to 1
                        bufferSize: 4096  //256 to 16384
                    }
                }
            });

            //Set the volume before playing
            if(parseInt($scope.tracks[index].playbackVolume) == 0) $scope.tracks[index].playbackVolume = "1"

            $scope.tracks[index].player.setVolume(parseInt($scope.tracks[index].playbackVolume) / 100);

            //Also save an init volume multiplier
            $scope.tracks[index].initVolumeMul = 100 / parseInt($scope.tracks[index].playbackVolume);

            $scope.tracks[index].player.play();
            $scope.tracks[index].currentTime = 0;
            $scope.tracks[index].playbackSpeed = 100;
            $scope.tracks[index].playing = true;

            //Also expand it's view
            $scope.toggleTrackFader(true, index);
          }
      }

      function calculateTime(){
        for(var i=0;i<$scope.tracks.length;i++){
          if(!$scope.tracks[i].playing || !$scope.tracks[i].player || !$scope.tracks[i].player.decodedBuffer) continue;
          var current = $scope.tracks[i].currentTime + $scope.tracks[i].playbackSpeed/100;
          var total = $scope.tracks[i].player.decodedBuffer.duration;

          var remainingTime = (total - current);

          if(remainingTime > 0){
            $scope.tracks[i].timeRemaining = Math.round(remainingTime);
            $scope.tracks[i].currentTime =  Math.round(current);
          } else {
            $scope.tracks[i].timeRemaining = Math.round(total);
            $scope.tracks[i].currentTime =  $scope.tracks[i].playbackSpeed/100;
          }
        }
        setTimeout(function(){
          $scope.$apply();
          calculateTime();
        }, 1000);
      }

      //Function to show individula track effects
      $scope.trackFader = -1;
      $scope.toggleTrackFader = function(show, index) {

          if(show) {

              //Set the index to our scope variable to show ng-ifs
              $scope.trackFader = index;

              //Also save the height of the track for preety animations
              if($scope.tracks[index].playing) $scope.tracks[index].cardHeight = {'height': (defaultTrackHeight + 250) + 'px'};
              else $scope.tracks[index].cardHeight = {'height': (defaultTrackHeight + 160) + 'px'};
          }
          else {

              //Hide the faders
              $scope.trackFader = -1;

              //Also save the height of the track for preety animations
              if($scope.tracks[index].playing) $scope.tracks[index].cardHeight = {'height': (defaultTrackHeight + 90) + 'px'};
              else $scope.tracks[index].cardHeight = {'height': (defaultTrackHeight) + 'px'};
          }
      }

      //Effects
      //Volume
      $scope.masterVolume = 100;
      $scope.setVolume = function() {

          for(var i=0;i<$scope.tracks.length;i++){
            if($scope.tracks[i].playing) {

                //Making variables in relation to the master volume

                $scope.tracks[i].player.nodes[4].output.gain.value = parseInt($scope.tracks[i].playbackVolume) / 100 * $scope.tracks[i].initVolumeMul * parseInt($scope.masterVolume) / 100;


                console.log(parseInt($scope.tracks[i].playbackVolume));
                console.log(parseInt($scope.masterVolume));
                console.log($scope.tracks[i].player.nodes[4].output.gain.value);
            }
          }
      }

      //Volume
      $scope.setTrackVolume = function(index) {

          //Making variables in relation to the master volume
          if($scope.tracks[index].playing) $scope.tracks[index].player.nodes[4].output.gain.value = parseInt($scope.tracks[index].playbackVolume) / 100 * $scope.tracks[index].initVolumeMul * parseInt($scope.masterVolume) / 100;
          console.log(parseInt($scope.tracks[index].playbackVolume));
          console.log(parseInt($scope.masterVolume));
          console.log($scope.tracks[index].player.nodes[4].output.gain.value);

      }

      //Speed
      $scope.masterSpeed = 100;
      $scope.setSpeed = function() {

        for(var i=0;i<$scope.tracks.length;i++){
          if($scope.tracks[i].playing) {

            $scope.tracks[i].player.soundSource.playbackRate.value = parseInt($scope.masterSpeed) / 100 * parseInt($scope.tracks[i].playbackSpeed) / 100;
          }
        }
      }

      //Speed
      $scope.setTrackSpeed = function(index) {
          if($scope.tracks[index].playing) $scope.tracks[index].player.soundSource.playbackRate.value = parseInt($scope.masterSpeed) / 100 * parseInt($scope.tracks[index].playbackSpeed) / 100;
      }


      //Delay
      $scope.masterDelay = 0;
      $scope.setDelay = function() {

          var time = 1.5;
          var delay = parseInt($scope.masterDelay) / 100;

          for(var i=0;i<$scope.tracks.length;i++){
            if($scope.tracks[i].playing){
              //Set the value
              $scope.tracks[i].player.delay.delayTime = time;
              $scope.tracks[i].player.delay.wet = delay;
              $scope.tracks[i].player.delay.feedback = delay;

              //Set the node's value
              $scope.tracks[i].player.delay.delayNode.delayNode.delayTime.value = time;

              $scope.tracks[i].player.delay.delayNode.feedbackNode.gain.value = delay;
              $scope.tracks[i].player.delay.delayNode.wetNode.gain.value = delay;
            }
          }
      }

      //Reverb
      $scope.masterReverb = 0;
      $scope.setReverb = function() {

        for(var i=0;i<$scope.tracks.length;i++){
          if($scope.tracks[i].playing){
            //Set the value
            $scope.tracks[i].player.reverb.wet = parseInt($scope.masterReverb) / 100;

            //Set the node's value
            $scope.tracks[i].player.reverb.node.wet.gain.value = parseInt($scope.masterReverb) / 100;
          }
        }
      }

      //Lowpass filter
      $scope.masterLowPass = 4000;
      $scope.setLowPass = function() {

        for(var i=0;i<$scope.tracks.length;i++){
          if($scope.tracks[i].playing){
            //Set the value
            $scope.tracks[i].player.filter[0].frequency = $scope.masterLowPass;

            //Set the node's value
            $scope.tracks[i].player.filter[0].node.frequency.value = $scope.masterLowPass;
          }
        }
      }

      //BitCrushing
      $scope.masterBitCrush = 16;
      $scope.setBitCrush = function() {
          for(var i=0;i<$scope.tracks.length;i++){
            if($scope.tracks[i].playing){
              //Set the value
              $scope.tracks[i].player.nodes[2].processor.bits = parseInt($scope.masterBitCrush);
              $scope.tracks[i].player.nodes[2].processor.normfreq = parseInt($scope.masterBitCrush) / 16;
            }
          }
      }

      //Start the timer thread
      calculateTime();
  }
})();
