const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const Question = require('../models/questions');
const Answer = require('../models/answers');
const { secret } = require('../config');

class UsersCtl {
     async find(ctx) {
         const { per_page = 10 } = ctx.query;
         const { page = 1 } = ctx.query;
         const Page = Math.max(page * 1,1)-1;
         const perPage = Math.max(per_page * 1,1);
         // console.log(`Page:${Page}`);
         // console.log(`perpage:${perPage}`);
         ctx.body = await User
             .find({name: new RegExp(ctx.query.q)})
             .limit(perPage)
             .skip(Page*perPage);
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectedFields = fields
            .split(';')
            .filter(f => f)
            .map(f => ' +'+f)
            .join('');
        const populateFields = fields
            .split(';')
            .filter(f => f)
            .map(f => {
                if(f === 'employments'){
                    return 'employments.company employments.job';
                }
                if(f === 'educations'){
                    return 'educations.school educations.major';
                }
                return f;
            })
            .join(' ');
        const user =  await User
            .findById(ctx.params.id)
            .select(selectedFields)
            .populate(populateFields);
        if(!user) { ctx.throw(404,'User Not Found'); }
        ctx.body = user;
    }

    async create(ctx) {
        ctx.verifyParams({
            name: {type:'string', required: true},
            password: {type:'string', required: true},
            age: {type:'number', required: false}
        });
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name });
        if( repeatedUser ) { ctx.throw(409,'Repeated User');}
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }

    async checkOwner(ctx,next){
        if(ctx.params.id !== ctx.state.user._id){
            ctx.throw(403,'No Authority');
        }
        await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            name: {type:'string', required: false},
            password: {type:'string', required: false},
            age: {type:'number', required: false},
            avatar_url: {type:'string', required: false},
            gender: {type:'string', required: false},
            headline: {type:'string', required: false},
            locations: {type:'array', itemType: 'string', required: false},
            business: {type:'string', required: false},
            employments: {type:'array', itemType: 'object', required: false},
            educations: {type:'array', itemType: 'object', required: false},
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if(!user){ ctx.throw(404,'User Not Found'); }
        ctx.body = user;
    }

    async delete(ctx) {
         const user = await User.findByIdAndRemove(ctx.params.id);
         if(!user){ ctx.throw(404,'User Not Found'); }
         ctx.status = 204;
    }

    async login(ctx) {
        ctx.verifyParams({
            name: {type:'string', required: true},
            password: {type:'string', required: true}
        });
        const user = await User.findOne(ctx.request.body);
        if(!user) { ctx.throw(401,'Wrong user name or password');}
        const { _id, name } = user;
        const token = jsonwebtoken.sign({ _id, name }, secret, {expiresIn: '1d'});
        ctx.body = { token };
    }

    async checkUserExists(ctx,next){
         const user = await User.findById(ctx.params.id);
         if(!user){ ctx.throw(404, 'User Not Found'); }
         await next();
    }

    async follow(ctx) {
         const me = await User.findById(ctx.state.user._id).select('+following');
         if(!me.following.map(id => id.toString()).includes(ctx.params.id)){
            me.following.push(ctx.params.id);
            me.save();
         }
         ctx.status = 204;
    }

    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.following.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async getFollowingList(ctx) {
        const user = await User
            .findById(ctx.params.id)
            .select('+following')
            .populate('following');
        if(!user){ throw(404,'User Not Found'); }
        ctx.body = user.following;
    }

    async getFollowersList(ctx) {
        const users = await User.find({ following: ctx.params.id });
        ctx.body = users;
    }

    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        if(!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)){
            me.followingTopics.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.followingTopics.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async getFollowingTopicsList(ctx) {
        const user = await User
            .findById(ctx.params.id)
            .select('+followingTopics')
            .populate('followingTopics');
        if(!user){ throw(404,'User Not Found'); }
        ctx.body = user.followingTopics;
    }

    async getQuestionsList(ctx) {
         const questions = await Question.find({ questioner: ctx.params.id });
         ctx.body = questions;
    }

    async upvoteAnswer(ctx,next) {
        const me = await User
            .findById(ctx.state.user._id)
            .select('+upvotedAnswers');
        if(!me.upvotedAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.upvotedAnswers.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
        }
        ctx.status = 204;
        await next();
    }

    async upvoteAnswerCancel(ctx) {
        const me = await User
            .findById(ctx.state.user._id)
            .select('+upvotedAnswers');
        const index = me.upvotedAnswers
            .map(id => id.toString())
            .indexOf(ctx.params.id);
        if(index > -1){
            me.upvotedAnswers.splice(index, 1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
        }
        ctx.status = 204;
    }

    async getUpvotedAnswersList(ctx) {
        const user = await User
            .findById(ctx.params.id)
            .select('+upvotedAnswers')
            .populate('upvotedAnswers');
        if(!user){ throw(404,'User Not Found'); }
        ctx.body = user.upvotedAnswers;
    }

    async downvoteAnswer(ctx,next) {
        const me = await User
            .findById(ctx.state.user._id)
            .select('+downvotedAnswers');
        if(!me.downvotedAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.downvotedAnswers.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
        }
        ctx.status = 204;
        await next();
    }

    async downvoteAnswerCancel(ctx) {
        const me = await User
            .findById(ctx.state.user._id)
            .select('+downvotedAnswers');
        const index = me.downvotedAnswers
            .map(id => id.toString())
            .indexOf(ctx.params.id);
        if(index > -1){
            me.downvotedAnswers.splice(index, 1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
        }
        ctx.status = 204;
    }

    async getDownvotedAnswersList(ctx) {
        const user = await User
            .findById(ctx.params.id)
            .select('+downvotedAnswers')
            .populate('downvotedAnswers');
        if(!user){ throw(404,'User Not Found'); }
        ctx.body = user.downvotedAnswers;
    }

    async collectAnswer(ctx) {
        const me = await User
            .findById(ctx.state.user._id)
            .select('+collectedAnswers');
        if(!me.collectedAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.collectedAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async collectAnswerCancel(ctx) {
        const me = await User
            .findById(ctx.state.user._id)
            .select('+collectedAnswers');
        const index = me.collectedAnswers
            .map(id => id.toString())
            .indexOf(ctx.params.id);
        if(index > -1){
            me.collectedAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async getCollectedAnswersList(ctx) {
        const user = await User
            .findById(ctx.params.id)
            .select('+collectedAnswers')
            .populate('collectedAnswers');
        if(!user){ throw(404,'User Not Found'); }
        ctx.body = user.collectedAnswers;
    }
}

module.exports = new UsersCtl();