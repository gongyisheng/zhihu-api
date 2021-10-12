const Answer = require('../models/answers');
const User = require('../models/users');

class AnswersCtl {
     async find(ctx) {
         const { per_page = 10 } = ctx.query;
         const { page = 1 } = ctx.query;
         const Page = Math.max(page * 1,1)-1;
         const perPage = Math.max(per_page * 1,1);
         const q = new RegExp(ctx.query.q);
        ctx.body = await Answer
            .find({ content: q, questionId: ctx.params.questionId })
            .limit(perPage)
            .skip(Page*perPage);
    }

    async checkAnswerExists(ctx,next){
        const answer = await Answer
            .findById(ctx.params.id)
            .select('+answerer');
        if(!answer){ ctx.throw(404, 'Answer Not Found'); }
        // console.log(answer.questionId);
        // console.log(ctx.params.questionId);
        //只有在删改查时才检查此逻辑，赞和踩不检查
        if( ctx.params.questionId && answer.questionId.toString() !== ctx.params.questionId){
            ctx.throw(404, 'This answer is not to the question')
        }
        ctx.state.answer = answer;
        await next();
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectedFields = fields
            .split(';')
            .filter(f => f).map(f => ' +'+f)
            .join('');
        const answer =  await Answer
            .findById(ctx.params.id)
            .select(selectedFields)
            .populate('answerer');
        ctx.body = answer;
    }

    async create(ctx) {
        ctx.verifyParams({
            content: {type:'string', required: true},
        });
        const answerer = ctx.state.user._id;
        const { questionId } = ctx.params;
        const answer = await new Answer({...ctx.request.body, answerer, questionId}).save();
        ctx.body = answer;
    }

    async checkAnswerer(ctx,next){
         const { answer } = ctx.state;
         if(answer.answerer.toString() !== ctx.state.user._id){
             ctx.throw(403,"No Authority to Edit the Answer");
         }
         await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            content: {type:'string', required: false},
        });
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }

    async delete(ctx) {
        await Answer.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }

}

module.exports = new AnswersCtl();