const Router = require('koa-router');
const router = new Router({prefix: '/questions/:questionId/answers'});
const {
    find, findById, create, update, delete: del,
    checkAnswerer, checkAnswerExists} = require('../controllers/answers')

const jwt = require('koa-jwt');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);
router.post('/',auth , create);
router.get('/:id',checkAnswerExists, findById);
router.patch('/:id', auth, checkAnswerExists, checkAnswerer, update);
router.delete('/:id', auth, checkAnswerExists, checkAnswerer, del);

module.exports = router;