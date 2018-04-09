const express = require('express');
const router = express.Router();
const Recipe = require('../../models/Recipe');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication.js');

router.all('/*', userAuthenticated, (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    const promises = [
      Recipe.count().exec(),
      Comment.count().exec(),
    ];
    Promise.all(promises).then(([recipeCount, commentCount])=>{
      res.render('admin/index', {recipeCount:recipeCount, commentCount: commentCount});
    })
});


module.exports = router;
