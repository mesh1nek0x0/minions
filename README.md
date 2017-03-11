# minions
minions is slack bot with jenkins + selenium.

# for users
## step overview
1. add slack-bot token to .env.minions
1. docker-compose up -d
1. setting up git server generate ssh-key for git server on jenkins
 1. In case of git server, StrictHostKeyChecking no on .ssh/config
 1. generate ssh-key & copy public key
 1. add public key to git repository
1. setting up jenkins
 1. install AnsiColor & slack-notification
1. let's add job!

## container manual

### how to start (slack bot with jenkins-php)
```
$ docker-composer up -d
```

### how to restart slackbot
```
$ docker-compose restart minions
```

### how to remove
```
$ docker-composer stop
$ docker-composer rm -v
```

# for developers
Use nodemon for monitoring any changes in your source code and restarting server.
```
$ docker-compose run --rm minions /bin/bash
# token=$MINIONS_TOKEN $(npm bin)/nodemon
```
