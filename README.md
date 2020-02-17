# Sauce Connect Proxy Problem

Sauce Connect Proxy seems to break WebSocket upgrades on relatively recent
platform/browser combinations.

To replicate, clone this repo and do:

```
npm install
node index.js
```

The Node script starts a local webserver on http://localhost:3000 that hosts a
client HTML file and accepts inbound WebSocket connections. Debugging output is
printed to the console. The script also starts the Sauce Connect Proxy and
creates a tunnel called "my-sauce-tunnel" (you'll need your Sauce credentials in
environmental variables).

If you go to http://localhost:3000 in a local browser, WebSocket open and
message events are printed to the browser console. It works.

If you do a live web test on the Sauce website, results vary by browser. Using
Windows, the tests work using Firefox 64 and Chrome 70 and lower -- you get the
desired console output.

On Firefox 65 and Chrome 71 and beyond, the browser console reports that the
WebSocket upgrade failed due to a 404 error being returned by the server.

The browser console reports that it made an upgrade request along the following
lines:

```
GET /my-websocket-url HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Sec-WebSocket-Version: 13
Origin: http://localhost:3000
Sec-WebSocket-Extensions: permessage-deflate
Sec-WebSocket-Key: rkhTc9x8O3omnS5zRNPyrg==
Connection: keep-alive, Upgrade
Pragma: no-cache
Cache-Control: no-cache
Upgrade: websocket
```

But in the Node console, the request is received as follows:

```
GET /my-websocket-url HTTP/1.1
Origin: http://localhost:3000
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
sec-websocket-version: 13
Accept: */*
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/73.0
sec-websocket-key: rkhTc9x8O3omnS5zRNPyrg==
Pragma: no-cache
sec-websocket-extensions: permessage-deflate
Content-Length: 0
Host: localhost:3000
Via: 1.1 maki1879 (squid/4.6)
Cache-Control: no-cache
Connection: keep-alive
X-SL-Job-ID: a56d371f1b3e43fca7769009675f95a6
X-SL-Tunnel-ID: 2a56221f3c4144239ab9b50e67cd2232
X-SL-Chef-IP: 10.100.52.118
```

As best as I can tell, the Sauce Connect Proxy is breaking the upgrade request
by removing `Upgrade: websocket` (and probably some other changes). As a result,
the web server views the request as a traditional HTTP request and returns a 404
error.

I am not sure why this problem only seems to apply to Firefox 65+ and Chrome
71+. It also applies to other platform/browser combos, but I've stuck to Firefox
and Chrome here for simplicity. The Sauce Connect Proxy does not seem to modify
upgrade requests from earlier versions of Chrome and Firefox.
