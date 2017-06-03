function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.age = user.age;
};



module.exports = User;

User.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email
  };
};

