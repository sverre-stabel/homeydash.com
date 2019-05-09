# Homey.ink

Homey.ink is an open-source project for wall-mounted Homey dashboards.
This fork is primarily aimed at usage on an iPad or iPhone

![Homey.ink on iPad](https://raw.githubusercontent.com/daneedk/homey.ink/master/assets/devices/ipad/ipad.png)
![Homey.ink on iPhone](https://raw.githubusercontent.com/daneedk/homey.ink/master/assets/devices/iphone/iphone.png)

## Debugging

To run this locally:

```
npm i -g serve
git clone https://github.com/daneedk/homey.ink
cd homey.ink
serve -p 5000 app
```
Then visit `http://localhost:5000/?token=<TOKEN>&theme=web` 
or visit `http://localhost:5000/?token=<TOKEN>&theme=iphone`

Or host it on your own favorite webserver, doing so may need changes to the source you need to do yourself.

> Your token can be acquired by visiting https://homey.ink and looking in the console after logging in.
