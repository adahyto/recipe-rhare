const express = require('express');
const router = express.Router();
const Recipe = require('../../models/Recipe');
const Comment = require('../../models/Comment');
const { userAuthenticated } = require('../../helpers/authentication.js');

router.all('/*', userAuthenticated, (req, res, next) => {
  req.app.locals.layout = 'admin';
  next();
});

router.get('/', (req, res) => {
  Comment.find({ user: req.user.id })
    .populate('user')
    .then(comments => {
      res.render('admin/comments', { comments: comments });
    });
});

router.get('/my-comments', (req, res) => {
  Recipe.find({ user: req.user.id })
    .populate('comments')
    .populate('user')
    .then(recipes => {
      res.render('admin/comments/my-comments', { recipes: recipes });
    });
});

router.post('/', (req, res) => {
  Recipe.findOne({ _id: req.body.id }).then(recipe => {
    const newComment = new Comment({
      user: req.user.id,
      body: req.body.body
    });
    recipe.comments.push(newComment);
    recipe.save().then(savedRecipe => {
      newComment.save().then(savedComment => {
        req.flash('success_message', 'Your comment will be reviewed');
        res.redirect(`/recipe/${recipe.slug}`);
      });
    });
  });
});

router.delete('/:id', (req, res) => {
  Comment.remove({ _id: req.params.id }).then(result => {
    Recipe.findOneAndUpdate({ comments: req.params.id }, { $pull: { comments: req.params.id } }, (err, data) => {
      if (err) console.log(err);
      res.redirect('/admin/comments/my-comments');
    });
  });
});

router.post('/approve-comment', (req, res) => {
  Comment.findByIdAndUpdate(req.body.id, { $set: { approveComment: req.body.approveComment } }, (err, result) => {
    if (err) return err;
    res.send(result);
  });
});

module.exports = router;
