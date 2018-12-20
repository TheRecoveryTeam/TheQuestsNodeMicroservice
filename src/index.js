const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const bearerToken = require('koa-bearer-token');


const app = new Koa();

app.use(bodyParser({
    extendTypes: {
        json: ['application/json'],
    },
}));

app.use(bearerToken({
    headerKey: 'Bearer',
}));

app.use(require('./routes').routes());

const port = process.env.NODE_PORT;

console.log(port);

app.listen(port, () =>
    console.log(`Server is listening at ${port} port`));
