const Comments = require('../models/comments');
const User = require('../models/users');

class CommentsCtl {
     async find(ctx) {
         const { per_page = 10 } = ctx.query;
         const { page = 1 } = ctx.query;
         const Page = Math.max(page * 1,1)-1;
         const perPage = Math.max(per_page * 1,1);
         const q = new RegExp(ctx.query.q);
         const { questionId, answerId } = ctx.params;
         const { rootCommentId } = ctx.query;
        ctx.body = await Comments
            .find({ content: q, questionId, answerId, rootCommentId })
            .limit(perPage)
            .skip(Page*perPage)
            .populate('commentator replyTo');
    }

    async checkCommentExists(ctx,next){
        const comment = await Comments
            .findById(ctx.params.id)
            .select('+commentator');
        if(!comment){ ctx.throw(404, 'Comments Not Found'); }
        if( ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId){
            ctx.throw(404, 'This comment is not to the question');
        }
        if( ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId){
            ctx.throw(404, 'This comment is not to the answer');
        }
        ctx.state.comment = comment;
        await next();
    }

    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectedFields = fields
            .split(';')
            .filter(f => f).map(f => ' +'+f)
            .join('');
        const comment =  await Comments
            .findById(ctx.params.id)
            .select(selectedFields)
            .populate('commentator');
        ctx.body = comment;
    }

    async create(ctx) {
        ctx.verifyParams({
            content: {type:'string', required: true},
            rootCommentId: {type:'string', required: false},
            replyTo: {type:'string', required: false},
        });
        const commentator = ctx.state.user._id;
        const { questionId, answerId } = ctx.params;
        const comment = await new Comments({...ctx.request.body, commentator, questionId, answerId}).save();
        ctx.body = comment;
    }

    async checkCommentator(ctx,next){
         const { comment } = ctx.state;
         if(comment.commentator.toString() !== ctx.state.user._id){
             ctx.throw(403,"No Authority to Edit the Comments");
         }
         await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            content: {type:'string', required: false},
        });
        const { content } = ctx.request.body;
        await ctx.state.comment.update( content );
        ctx.body = ctx.state.comment;
    }

    async delete(ctx) {
        await Comments.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }


}

module.exports = new CommentsCtl();