const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const answerSchema = new Schema({
    __v: {type: Number, select: false},
    content: { type: String, required: true },
    description: { type: String, required: false, select: false },
    answerer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        select: false },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true},
    voteCount: { type: Number, required: true, default: 0 }
},{ timestamps: true });

module.exports = model('Answer', answerSchema);