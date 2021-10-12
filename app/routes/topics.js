const Router = require('koa-router');
const router = new Router({prefix: '/topics'});
const {
    find, findById, create, update,
    checkTopicExists, getTopicFollowersList,
    getQuestionsList, } = require('../controllers/topics')

const jwt = require('koa-jwt');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);
router.post('/',auth , create);
router.get('/:id', checkTopicExists, findById);
router.patch('/:id', auth, checkTopicExists, update);

router.get('/:id/followers', checkTopicExists, getTopicFollowersList);

router.get('/:id/questions', checkTopicExists, getQuestionsList);

 module.exports = router;