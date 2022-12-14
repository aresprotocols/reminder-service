### STAGE 1: Build ###
# We label our stage as ‘builder’

### STAGE 1: Build ###
# We label our stage as ‘builder’
FROM node:14-alpine as builder

COPY package.json ./

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
#RUN apk add --no-cache python2 g++ make git && \
#    yarn install && mkdir /ng-app && mv ./node_modules ./ng-app

RUN apk update && apk upgrade
RUN apk --no-cache --virtual build-dependencies add \
        python3 \
        make \
        git \
        g++ \
&& yarn install \
&& apk del build-dependencies \
&& mkdir /ng-app && mv ./node_modules ./ng-app

WORKDIR /ng-app

COPY . /ng-app/

RUN yarn build
RUN pwd
RUN ls /ng-app
RUN ls /ng-app/dist

CMD ["yarn", "start"]
#
#### STAGE 2: Setup ###
#FROM nginx:1.14.1-alpine
#
##ARG NGINX_CONF=nginx/polkascan-prod.conf
##ENV NGINX_CONF=$NGINX_CONF
##
#### Remove default nginx configs
##RUN rm -rf /etc/nginx/conf.d/*
##
#### Copy our default nginx config
###COPY nginx/polkascan.conf /etc/nginx/conf.d/
##COPY ${NGINX_CONF} /etc/nginx/conf.d/
#
### Remove default nginx website
#RUN rm -rf /usr/share/nginx/html/*
#
### From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
#COPY --from=builder /ng-app/dist /usr/share/nginx/html
#
#CMD ["nginx", "-g", "daemon off;"]