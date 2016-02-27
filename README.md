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
