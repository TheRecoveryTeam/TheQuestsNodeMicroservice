const Router = require('koa-router');


const userRouter = new Router({
    prefix: '/user',
});

userRouter.get('/vk_oauth2', require('./processVkOauth'));

module.exports = userRouter;
