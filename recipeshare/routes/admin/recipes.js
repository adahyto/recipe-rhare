const express = require('express');
const router = express.Router();
const fs = require('fs');
const Recipe = require('../../models/Recipe');
const{ isEmpty, uploadDir } = require('../../helpers/upload-helper');
const {userAuthenticated} = require('../../helpers/authentication.js');

router.all('/*', (req, res, next)=>{
  req.app.locals.layout = 'admin';
  next();
});

//MAKE THIS SUPERUSER
router.get('/', (req, res)=>{
  Recipe.find({})
    .then(recipes=>{
      res.render('admin/recipes', {recipes: recipes});
    });
});

router.get('/my-recipes', (req, res)=>{
    Recipe.find({user: req.user.id})
    .then(recipes=>{
        res.render('admin/recipes/my-recipes', {recipes: recipes});
    });
});

router.get('/create', (req, res)=>{
  res.render('admin/recipes/create');
});
router.post('/create', (req, res)=>{
  var filename = '';
  if (!isEmpty(req.files)) {
            let file = req.files.file;
            filename = Date.now() +'-'+ file.name;
            file.mv(`${__dirname}/../../public/uploads/${filename}`, (err)=>{
                if(err) throw err;
            });
  }else { console.log('empty');}
          console.log(req.files);
  let allowComments = true;
  if(req.body.allowComments){
    allowComments = true;
  }else{
    allowComments = false;
  }
  const newRecipe = new Recipe({
    user: req.user.id,
    title: req.body.title,
    allowComments: allowComments,
    short: req.body.short,
    body: req.body.body,
    file: filename
  });
  newRecipe.save()
    .then(savedRecipe=>{
      res.redirect('/admin/recipes');
    }).catch(error=>{
      console.log(error, 'could not save the recipe');
    });
});

router.get('/edit/:id', (req, res)=>{
  Recipe.findOne({_id: req.params.id})
    .then(recipe=>{
      res.render('admin/recipes/edit', {recipe: recipe});
    });
});
router.put('/edit/:id', (req, res)=>{
  Recipe.findOne({_id: req.params.id})
    .then(recipe=>{
      if (req.body.allowComments) {
          allowComments = true;
      }else {
          allowComments = false;
      }
      recipe.user = req.user.id;
      recipe.title = req.body.title;
      recipe.allowComments = allowComments;
      recipe.body = req.body.body;
      recipe.short = req.body.short;
      if (!isEmpty(req.files)) {
                let file = req.files.file;
                filename = Date.now() +'-'+ file.name;
                post.file = filename;
                file.mv(`${__dirname}/../../public/uploads/${filename}`, (err)=>{
                    if(err) throw err;
                });
      }
      recipe.save()
        .then(updatedRecipe=>{
          res.redirect('/admin/recipes');
        });
    });
});

router.delete('/:id', (req, res)=>{
        Recipe.findOne({_id: req.params.id})
            .populate('comments')
            .then(recipe=>{
                    fs.unlink(uploadDir + recipe.file, (err)=>{
                        if(!recipe.comments.length < 1){
                          recipe.comments.forEach(comment=>{
                            comment.remove();
                          })
                        }
                        recipe.remove().then(recipeRemoved=>{
                          req.flash('success_message', `Recipe "${recipe.title}" was deleted succesfully`);
                          res.redirect('/admin/recipes');
                        });
                    });
            });
});

module.exports = router;
