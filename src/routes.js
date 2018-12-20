const Router = require('koa-router');

const router = new Router({ prefix: '/api' });

router.use(require('./user').routes());

module.exports = router;
