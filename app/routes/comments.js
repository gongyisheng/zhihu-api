const Router = require('koa-router');
const router = new Router({prefix: '/questions/:questionId/answers/:answerId/comments'});
const {
    find, findById, create, update, delete: del,
    checkCommentator, checkCommentExists} = require('../controllers/comments');

const jwt = require('koa-jwt');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);
router.post('/',auth , create);
router.get('/:id',checkCommentExists, findById);
router.patch('/:id', auth, checkCommentExists, checkCommentator, update);
router.delete('/:id', auth, checkCommentExists, checkCommentator, del);

module.exports = router;