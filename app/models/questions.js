const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const questionSchema = new Schema({
    __v: {type: Number, select: false},
    title: { type: String, required: true },
    description: { type: String, required: false, select: false },
    questioner: { type: Schema.Types.ObjectId, ref: 'User', select: false },
    topics: {
        type:[{ type: Schema.Types.ObjectId, ref: 'Topic' }],
        select: false,
    }
},{ timestamps: true });

module.exports = model('Question', questionSchema);