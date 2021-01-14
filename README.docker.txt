# Clone the portal-ui code from GitHub

    $ git clone https://github.com/ihmpdcc/portal-ui

# Build the container

    $ docker build -t portal-ui:latest .

# Use the built container to install the dependencies and libraries

    $ docker run -v $PWD:/export \
           -w /export/portal-ui \
           -ti portal-ui:latest \
           npm install

# Use the built container to build necessary artificats:

    $ docker run -v $PWD:/export \
           -w /export/portal-ui \
           -t portal-ui:latest \
           ./node_modules/.bin/gulp

# Launch the container to run the web application

    $ docker run -v $PWD:/export \
           -p 8080:3000 \
           -w /export/portal-ui \
           -t portal-ui:latest \
           ./node_modules/.bin/gulp serve:web

