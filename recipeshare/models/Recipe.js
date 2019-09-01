const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');

const RecipeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  date: {
    type: Date,
    default: Date.now()
  },
  allowComments: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String
  },
  short: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  file: {
    type: String
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'comments'
  }]
});

RecipeSchema.plugin(URLSlugs('title', { field: 'slug' }));
module.exports = mongoose.model('recipe', RecipeSchema);
