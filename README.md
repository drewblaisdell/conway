# Conway's Multiplayer Game of Life

Conway's Multiplayer Game of Life (Conway) is a real-time, persistent, multiplayer version of Conway's Game of Life.

## Installation

Run `grunt development` or just `grunt` to set up the development environment. This will move the shared core files to the client/server directories and start an Express server. 

``` bash
  $ grunt development
  ...
  $ node app
  Conway started: 3000 (development)
```

Run `grunt production` to set up the production environment. This will minify/concatenate the Javascript/CSS.

If your NODE_ENV environment variable is set to production, Conway will run in production. I'm using NginX to serve static assets, so Express does not serve the public folder in production.

``` bash
  $ grunt production
  ...
  $ NODE_ENV=production node app
  Conway started: 3000 (production)
```

## To-Do

*   The method names need to be alphabetized.
*   An underscore prefix is currently used to denote methods which may be accessed outside of each module. Some non-prefixed methods should be prefixed, and vice-versa.
*   I'm using RequireJS on the server. This was a decision that made sharing the /core files easier, but there must be a better way of sharing these files that lets me use CommonJS on the server and RequireJS on the client. 