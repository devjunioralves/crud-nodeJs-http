const http = require('http');
const { URL } = require('url');

const bodyParser = require('./helpers/bodyParser');

const routes = require('./routes');

const server = http.createServer((req, res) => {

  const parsedUrl = new URL(`http://localhost:3000${req.url}`);

  console.log(`Request method: ${req.method} and url: ${parsedUrl.pathname}
  `);

  let { pathname } = parsedUrl

  let id = null

  const splitEndpoint= pathname.split('/').filter(Boolean);

  if (splitEndpoint.length > 1) {

    pathname = `/${splitEndpoint[0]}/:id`
    id = splitEndpoint[1]
  }

  const route = routes.find((routeObj) => (
    routeObj.endpoint === pathname && routeObj.method === req.method
  ))

  if (route) {
    req.params = { id }
    req.query = Object.fromEntries(parsedUrl.searchParams);

    res.send = (statusCode, body) => {
      res.writeHead(statusCode, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(body));
    }

    if (['POST', 'PUT'].includes(req.method)) {
      bodyParser(req, () => route.handler(req, res))
    }
    else {
      route.handler(req, res);
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`Cannot ${req.method} ${parsedUrl.pathname}`);
  }

})

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});