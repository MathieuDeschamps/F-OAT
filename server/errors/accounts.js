Accounts.validateNewUser(function(user){

  if (!user.username){
    throw new Meteor.Error(500,'errorRegisterUsernameEmpty');
  }

  if(user.username.indexOf('/')!==-1){
    throw new Meteor.Error(500,'errorRegisterUsernameWrong')
  }

  if(Meteor.users.findOne({username: user.username})){
    throw new Meteor.Error(500,'errorRegisterUsernameExists');
  }

  if (!user.emails){
    throw new Meteor.Error(500,'errorRegisterEmailEmpty');
  }


  var regex = /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,3}$/;
  if(!regex.test(user.emails[0].address)){
      throw new Meteor.Error(500, 'errorRegisterEmailWrong');
  }

  if(Meteor.users.findOne({"emails.0.address": user.emails[0].address})){
    throw new Meteor.Error(500, 'errorRegisterEmailExists');
  }

  return true;

});

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('users', function usersPublication() {
    return Meteor.users.find();
  });

}
