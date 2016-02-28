(function() {
  'use strict';

  angular.module('Home', []).
  controller('MainController', ['$scope', MainController]);

  function MainController($scope) {

      //Our node requirements
      var path = require('path');
      var fs = require('fs');
      var dirTree = require('directory-tree');
      var remote = require('remote');
      var dialog = remote.require('dialog');

      //Electron File Menu
      const electronRemote = require('electron').remote
      const Menu = electronRemote.Menu;
      const MenuItem = electronRemote.MenuItem;
      var template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Show Tutorial',
        click: function() { $scope.showTutorial = true; }
      },
    ]
  },
];

if (process.platform == 'darwin') {
  var name = require('electron').app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);



      //Our files
      $scope.tracks = [];

      $scope.directory = {};
      $scope.directoryRoot = "";

      //Our default track height
      var defaultTrackHeight = 115;

      //Check if the user has used the app before
      var hasUsed = localStorage.getItem("tutorial");
      if(!hasUsed) $scope.showTutorial = true;

      $scope.hideTutorial = function() {
          $scope.showTutorial = false;
      }

      //Open a file
      $scope.openFile = function() {
          dialog.showOpenDialog({ properties: [ 'openFile' ]}, function(fileName) {
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

      $scope.addFile = function(fileName){
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

        console.log(document.getElementById("trackTitle-" + index).style.height);

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
                loop: true,
                env : { hold : 100000000 },
                delay   : {
                      delayTime : 0.5,  // Time in seconds between each delayed playback.
                      wet       : 0, // Relative volume change between the original sound and the first delayed playback.
                      feedback  : 0, // Relative volume change between each delayed playback and the next.
                },
                reverb  : {
                    wet     : 0,  // Volume of the reverberations.
                    impulse : '../sounds/impulse.wav' // A URL for an impulse response file, if you do not want to use the default impulse response.
                },
                filter  : {
                      type      : 'lowpass', // What type of filter is applied.
                      frequency : 4000,       // The frequency, in hertz, to which the filter is applied.
                      q         : 3,         // Q-factor.  No one knows what this does. The default value is 1. Sensible values are from 0 to 10.
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
            $scope.tracks[i].timeRemaining = total;
            $scope.tracks[i].currentTime =  $scope.tracks[i].playbackSpeed;
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
                $scope.tracks[i].player.nodes[3].output.gain.value = (parseInt($scope.masterVolume) / 100 * $scope.tracks[i].initVolumeMul);
                $scope.tracks[i].playbackVolume = $scope.masterVolume;
            }
          }
      }

      //Volume
      $scope.setTrackVolume = function(index) {

          if($scope.tracks[index].playing) $scope.tracks[index].player.nodes[3].output.gain.value = (parseInt($scope.tracks[index].playbackVolume) / 100 * $scope.tracks[index].initVolumeMul);
      }

      //Speed
      $scope.masterSpeed = 100;
      $scope.setSpeed = function() {

        for(var i=0;i<$scope.tracks.length;i++){
          if($scope.tracks[i].playing) {
            $scope.tracks[i].player.soundSource.playbackRate.value = parseInt($scope.masterSpeed) / 100;
            $scope.tracks[i].playbackSpeed = $scope.masterSpeed;
          }
        }
      }

      //Speed
      $scope.setTrackSpeed = function(index) {
          if($scope.tracks[index].playing) $scope.tracks[index].player.soundSource.playbackRate.value = parseInt($scope.tracks[index].playbackSpeed) / 100;
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

      //Start the timer thread
      calculateTime();
  }
})();
