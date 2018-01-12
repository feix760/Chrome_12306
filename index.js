// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
  // limit: '1mb',
  // extended: true
// }));

const Koa = require('koa');
const Router = require('koa-router');
const chalk = require('chalk');
const app = new Koa();
const router = new Router();

const controller = {
  home: require('./app/controller/home'),
};

router.get('/', controller.home.index);

app.use(router.routes())
  .use(router.allowedMethods());

app.listen(8000, () => {
  console.log(chalk.green(`Server listening on port 8000`));
});

