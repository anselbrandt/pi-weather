# Fetch Weather from Environment Canada

Displays weather on Raspberry Pi Sense Hat

### PM2 Start Script (Requires PM2 installed globally)

```
pm2 start weather.js --cron-restart="* * * * *"
```

Restarts every minute (of every hour of every day of every month and every day of the week).

```
 * * * * *  command to execute
 ┬ ┬ ┬ ┬ ┬
 │ │ │ │ │
 │ │ │ │ │
 │ │ │ │ └───── day of week (0 - 7) (0 to 6 are Sunday to Saturday, or use names; 7 is Sunday, the same as 0)
 │ │ │ └────────── month (1 - 12)
 │ │ └─────────────── day of month (1 - 31)
 │ └──────────────────── hour (0 - 23)
 └───────────────────────── min (0 - 59)
```

```
Start and Daemonize any application:
$ pm2 start app.js

Load Balance 4 instances of api.js:
$ pm2 start api.js -i 4

Monitor in production:
$ pm2 monitor

Make pm2 auto-boot at server restart:
$ pm2 startup

To go further checkout:
http://pm2.io/
```
