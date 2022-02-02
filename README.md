# Fetch Weather from Environment Canada

Displays weather on Raspberry Pi Sense Hat

### PM2 Start Script (Requires PM2 installed globally)

```
pm2 start weather.js --cron-restart="* * * * *"
```
