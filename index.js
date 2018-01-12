
const Koa = require('koa');
const koaBody = require('koa-body');
const router = require('koa-router')();
const chalk = require('chalk');

const app = new Koa();

app.use(koaBody({
  formLimit: '1mb',
}));

const controller = {
  home: require('./app/controller/home'),
};

router.post('/', controller.home.index);

app.use(router.routes())
  .use(router.allowedMethods());

const port = 8100;
app.listen(port, () => {
  console.log(chalk.green(`Server listening on port ${port}`));
});

