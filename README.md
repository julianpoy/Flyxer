# Flyxer

(Work in progress, Readme shall be update with application)

Last Update: 2/27/16 at 7:53AM During HackTech 2016.

![Early Screenshot](http://i.imgur.com/DLZiZlq.png)

##What Is Flyxer?
Flyxer is a live performance music software made in [Electron](http://electron.atom.io/) and the [Electron Angular Boilerplate](https://github.com/Stephn-R/electron-angular-boilerplate). It will allow for loop switching "on the fly" with an easy to use interface. Along with a large collection of effects to play and edit your sound.

##Installation (From the [Electron Angular Boilerplate](https://github.com/Stephn-R/electron-angular-boilerplate)):

The application runs using Node 4.2.4. I recommend using [nvm](https://github.com/creationix/nvm) to manage your node versions. In addition, node-sass is required globally.

For development, run:

```shell
./scripts/load_globals.sh
sudo npm install --python=python2.7
npm start
```

#### Known Bugs:

Node-sass may fail the `npm start` command. I recommend running the following command to fix this:

```
npm i -g node-sass
npm rebuild node-sass
```

##Team
Currently our team contsits of Aaron Turner, @torch2424, and Julian Poyourow, @julianpoy

## License

Licensed under the [Apache License 2.0](http://choosealicense.com/licenses/apache-2.0/)

###Random Wad fixes to do

This is more a hackathon note to self. After this is over, should definitely make some pull request.

- Fix tuna in wad. Add the window.tuna check
````javascript
var setUpTunaOnPlay = function(that, arg){
    if ( !( that.tuna || arg.tuna ) ) { return }
    var tunaConfig = {}
    if ( that.tuna ) {
        for ( var key in that.tuna ) {
            tunaConfig[key] = that.tuna[key]
        }
    }

    // overwrite settings from `this` with settings from arg
    if ( arg.tuna ) {
        for ( var key in arg.tuna ) {
            tunaConfig[key] = arg.tuna[key]
        }
    }
    console.log('tunaconfig: ', tunaConfig);

    //Try to set our tuna again
    if ( Wad.tuna == undefined &&
        window.Tuna != undefined ) {
        Wad.tuna = new Tuna(Wad.audioContext)
    }


    for ( var key in tunaConfig) {
        console.log(key);
        var tunaEffect = new Wad.tuna[key](tunaConfig[key]);
        that.nodes.push(tunaEffect)
    }
    // console.log(that.nodes)
}
````

- Add additonal effects to be manipulated live (Example with delay, can be done with all effects)
````javascript

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

````
