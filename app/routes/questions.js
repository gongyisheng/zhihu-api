const Router = require('koa-router');
const router = new Router({prefix: '/questions'});
const {
    find, findById, create, update, delete: del,
    checkQuestioner, checkQuestionExists} = require('../controllers/questions');

const jwt = require('koa-jwt');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);
router.post('/',auth , create);
router.get('/:id',checkQuestionExists, findById);
router.patch('/:id', auth, checkQuestionExists, checkQuestioner, update);
router.delete('/:id', auth, checkQuestionExists, checkQuestioner, del);

module.exports = router;