# To use this for local development:
# First build the image:
#
#   $ docker build -t portal-ui:latest .
#
# Then start the container:
#
#   $ docker run -p 8080:3000 -v $PWD:/export portal-ui
#
# Once running, one should be able to browse to http://localhost:8080
# If you invoked the "run" command inside the directory containing the code
#  base, then modifications
# to the code will be visible/testable with a page refresh as the -v option maps
# the code base to the container's apache document root.

FROM ubuntu:16.04

MAINTAINER IGS IFX <igs-ifx@som.umaryland.edu>

ARG DEBIAN_FRONTEND=noninteractive

# Install node 10.x and npm 6.4
RUN apt-get update && \
	apt-get install -y curl git subversion && \
	curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
	apt-get install -y nodejs

RUN mkdir /export

WORKDIR /export/portal-ui

# For a Docker-based production
#RUN mkdir /export && \
#    cd /export && \
#    svn co http://subversion.igs.umaryland.edu/svn/ENGR/portal/trunk/portal-ui
#

ENTRYPOINT [ "/export/portal-ui/entrypoint.sh" ]
