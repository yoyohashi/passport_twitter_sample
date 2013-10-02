
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('login', { title: 'Express' });
};

/*
 * GET login
 */

exports.login = function(req, res){
  res.render('login', { title: 'Express' });
};