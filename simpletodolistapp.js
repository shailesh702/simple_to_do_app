Tasks = new Mongo.Collection("tasks");
if(Meteor.isServer){
    Meteor.publish("tasks",function(){
      return Tasks.find({
        $or: [
          {private: {$ne:true}},
          {owner:this.userId}
        ]
      });
    });
}

if (Meteor.isClient) {
  // counter starts at 0
  //Session.setDefault('counter', 0);

  /*Template.body.helpers({
    tasks: [
      {text: "This is task 1"},
      {text: "This is task 2"},
      {text: "This is task 3"}
    ]

      
  });*/
Meteor.subscribe("tasks");
  
Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } 
      else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount : function(){
      return Tasks.find({checked : {$ne: true}}).count();
    }
  });

Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;
      Meteor.call("addTask",text);
      // Insert a task into the collection
      /*Tasks.insert({
        text: text,
        createdAt: new Date() // current time
      });
      */
      // Clear form
      event.target.text.value = "";
      },
      "change .hide-completed input": function (event) {
        Session.set("hideCompleted", event.target.checked);
    }
  });

Template.task.helpers({
  isOwner : function(){
    return this.owner === Meteor.userId();
  }
});

Template.task.events({

    "click .toggle-checked": function () {
     // Set the checked property to the opposite of its current value
    Meteor.call("setChecked",this._id, !this.checked);
    /*Tasks.update(this._id, {
          $set: {checked: ! this.checked}
       });*/
      },
      "click .delete": function () {
       //Tasks.remove(this._id);
       Meteor.call("deleteTask",this._id);
	   },
     "click .toggle-private": function(){
      Meteor.call("setPrivate",this._id, !this.private);
     }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}


Meteor.methods({
    addTask : function(text){
      if(! Meteor.userId()){
        throw new Meteor.Error("non-authorized");
      }

      Tasks.insert({
        text: text,
        createdAt : new Date(),
        owner : Meteor.userId(),
        username : Meteor.user().username
      });
    },
    deleteTask : function(taskId){
      //Tasks.remove(taskId);
      var task = Tasks.findOne(taskId);
      if(task.private && task.owner !== Meteor.userId()){
        throw new Meteor.Error("not-authorized");
      }
      Tasks.remove(taskId);
    },
    setChecked : function(taskId,setChecked){
        //Tasks.update(taskId, {$set : {checked:setChecked} });
        var task = Tasks.findOne(taskId);
        if(task.private && task.owner !== Meteor.userId()){
          throw new Meteor.Error("not-authorized");
        }
        Tasks.update(taskId,{$set: {checked:setChecked}});
    },
    setPrivate : function(taskId,setToPrivate){
      var task = Tasks.findOne(taskId);
      if(task.owner !== Meteor.userId()){
        throw new Meteor.Error("not-authorized");
      }
      Tasks.update(taskId,{$set: {private: setToPrivate} });
    }
});

  /*Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });*/
