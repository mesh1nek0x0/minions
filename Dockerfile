FROM node:7

# add application user
RUN useradd -s /bin/false -m minions && \
mkdir /home/minions/app && npm install forever -g

ENV HOME=/home/minions

COPY app/package.json $HOME/app/
RUN chown -R minions:minions $HOME/*

USER minions

WORKDIR /home/minions/app
RUN npm install

ENV APP_START_CMD start
CMD npm $APP_START_CMD
