const Router = require('koa-router');
const router = new Router({prefix: '/users'});
const {
    find, findById, create, update, delete: del,
    login, checkOwner, checkUserExists,
    follow, unfollow, getFollowingList, getFollowersList,
    followTopic, unfollowTopic, getFollowingTopicsList,
    getQuestionsList,
    upvoteAnswer, upvoteAnswerCancel, getUpvotedAnswersList,
    downvoteAnswer, downvoteAnswerCancel, getDownvotedAnswersList,
    collectAnswer, collectAnswerCancel, getCollectedAnswersList,} = require('../controllers/users')

const{ checkTopicExists } = require('../controllers/topics');
const{ checkAnswerExists } = require('../controllers/answers');

const jwt = require('koa-jwt');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);
router.post('/', create);
router.get('/:id', auth, findById);
router.patch('/:id', auth, checkUserExists, checkOwner, update);
router.delete('/:id', auth, checkUserExists, checkOwner, del);

router.post('/login',login);

router.put('/follow/:id', auth, checkUserExists, follow);
router.delete('/unfollow/:id',auth, checkUserExists, unfollow);
router.get('/:id/following', checkUserExists, getFollowingList);
router.get('/:id/followers', checkUserExists, getFollowersList);

router.put('/followTopic/:id', auth, checkTopicExists, followTopic);
router.delete('/unfollowTopic/:id',auth, checkTopicExists, unfollowTopic);
router.get('/:id/followingTopics',checkUserExists , getFollowingTopicsList);

router.get('/:id/questions',checkUserExists , getQuestionsList);

router.put('/upvoteAnswer/:id', auth, checkAnswerExists, upvoteAnswer, downvoteAnswerCancel);
router.delete('/upvoteAnswerCancel/:id',auth, checkAnswerExists, upvoteAnswerCancel);
router.get('/:id/upvotedAnswers',checkUserExists , getUpvotedAnswersList);
router.put('/downvoteAnswer/:id', auth, checkAnswerExists, downvoteAnswer, upvoteAnswerCancel);
router.delete('/downvoteAnswerCancel/:id',auth, checkAnswerExists, downvoteAnswerCancel);
router.get('/:id/downvotedAnswers',checkUserExists , getDownvotedAnswersList);

router.put('/collectAnswer/:id', auth, checkAnswerExists, collectAnswer);
router.delete('/collectAnswerCancel/:id',auth, checkAnswerExists, collectAnswerCancel);
router.get('/:id/collectedAnswers',checkUserExists , getCollectedAnswersList);

module.exports = router;