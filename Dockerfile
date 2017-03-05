FROM node:7

# add application user
RUN useradd -s /bin/false -m minions && \
mkdir /home/minions/app

# set volume
VOLUME ["/home/minions/app"]

USER minions

WORKDIR /home/minions/app

ENV APP_START_CMD start
CMD npm $APP_START_CMD
