var view;

var appendView = function(v) {
  v = v || view;
  Ember.run(function() { v.appendTo('#qunit-fixture'); });
};

module('dynamicView Helper', {
  setup: function() {
    window.TemplateTests = Ember.Namespace.create();
  },

  teardown: function() {
    if (view) view.destroy();
    window.TemplateTests = undefined;
  }
});

test("basic dynamic view", function() {
  view = Ember.View.create({
    template: Ember.Handlebars.compile("<section>{{dynamicView}}</section>")
  });
  
  var contentView = Ember.View.create({
    template: Ember.Handlebars.compile("<h1>Brogrammer was here</h1>")
  });
  
  view.setPath('content', contentView);
  
  Ember.run(function() {
    appendView();
  });
  
  var container = view.get('_childViews').objectAt(0);
  ok(container && container instanceof Ember.Handlebars.FrameView, "container should exist.");
  
  ok(/<section>.*Brogrammer.*<\/section>.*/.test(view.$().html()), "content should be correctly set");
});

test("nested dynamic views", function() {
  view = Ember.View.create({
    template: Ember.Handlebars.compile("<section>{{dynamicView}}</section>")
  });
  
  var innerView = Ember.View.create({
    template: Ember.Handlebars.compile("<header>{{dynamicView}}</header>")
  });
  
  var contentView = Ember.View.create({
    template: Ember.Handlebars.compile("<h1>Brogrammer was here</h1>")
  });
  
  view.setPath('content', innerView);
  innerView.setPath('content', contentView);
  
  Ember.run(function() {
    appendView();
  });
  
  var container = view.get('_childViews').objectAt(0);
  ok(container && container instanceof Ember.Handlebars.FrameView, "container should exist.");
  
  var innercontainer = innerView.get('_childViews').objectAt(0);
  ok(innercontainer && innercontainer instanceof Ember.Handlebars.FrameView, "container should exist.")
  
  ok(/<section>.*<header>.*Brogrammer.*<\/header>.*<\/section>.*/.test(view.$().html()), "content should be correctly set");
});

test("dynamic views allow custom property paths", function() {
  view = Ember.View.create({
    template: Ember.Handlebars.compile("<section><header>{{dynamicView header}}</header>{{dynamicView}}</section>")
  });
  
  var headerView = Ember.View.create({
    template: Ember.Handlebars.compile("<h1>Heads up!</h1>")
  });
  
  view.set('header', headerView);
  
  Ember.run(function() {
    appendView();
  });
  
  var headerContainer = view.get('_childViews').objectAt(0);
  ok(headerContainer && headerContainer instanceof Ember.Handlebars.FrameView, "container should exist.");
  
  var container = view.get('_childViews').objectAt(1);
  ok(container && container instanceof Ember.Handlebars.FrameView, "container should exist.");
  
  equals(headerContainer.get('_childViews').objectAt(0), headerView, "named dynamic view should contain headerView");
  equals(container.get('_childViews').get('length'), 0, "default dynamic view should have no content")
});









