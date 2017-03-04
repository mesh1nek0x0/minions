FROM node:7

# set timezone
RUN ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

# add application user
RUN useradd -s /bin/false -m minions && \
mkdir /home/minions/app

# set volume
VOLUME ["/home/minions/app"]

USER minions

WORKDIR /home/minions/app

ENV APP_START_CMD start
CMD npm $APP_START_CMD
