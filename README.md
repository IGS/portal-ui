`Buzzwords: #docker #typescript #angularjs #nodejs #gulp`

- [Technologies](#technologies)
- [Installation](#installation)
- [Development](#development)
- [Contributing](#contributing)
- [Production](#production)
- [Resources](#resources)

# Technologies

- [Angular](https://angularjs.org/) - HTML enhanced for web apps
- [AngularUI](http://angular-ui.github.io/) - The companion suite(s) to the AngularJS framework.
- [d3.js](https://d3js.org/) - Javascript charting and visualization framework.
- [Docker](https://docker.com/) - OS-level virtualization to deliver software in containers.
- [Typescript](http://www.typescriptlang.org/) - TypeScript lets you write JavaScript in a more type-safe manner.
- [Gulp.js](https://gulpjs.com/) - The streaming build system

# Installation

## Global Dependencies

Before continuing you must have the following programs installed:

- [Node](http://nodejs.org/)

## Setup Script

Running the setup script will:

1. Setup the needed git hook for the project
2. Install npm and bower dependencies

```
❯ ./setup.sh
commit-msg already exists! Backing up to commit-msg.bak...  OK
Setting up commit-msg git hook...                           OK
Making commit-msg executable...                             OK
Making validate-commit.py executable...                     OK
Confirming Node is installed...                             OK
Installing NPM dependencies...
...
Setup Successful!

```

### Running Locally

Local servers for development are best run with Docker containers. There is included support for Docker Compose.

```
❯ docker-compose up
```

### Project Dependencies

Project dependencies are managed using [NPM](https://www.npmjs.org/)

# Tests

Unit tests are run with npm.

```
❯ npm test
```

# Development

The development server is best run with the Docker containers.

```
❯ docker-compose up
```

# Resources

- [angularjs-via-typescript-controllers](http://kodeyak.wordpress.com/2014/02/12/angularjs-via-typescript-controllers/)
- [AngularJS + TypeScript : Controllers, Best Practice](https://www.youtube.com/watch?v=WdtVn_8K17E)
- [Angular Services using TypeScript : Best Practices](https://www.youtube.com/watch?v=Yis8m3BdnEM)
