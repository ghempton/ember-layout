var view;

var appendView = function(v) {
  v = v || view;
  Ember.run(function() { v.appendTo('#qunit-fixture'); });
};

module('Ember.LayoutView', {
  setup: function() {
    window.TemplateTests = Ember.Namespace.create();
  },

  teardown: function() {
    if (view) view.destroy();
    window.TemplateTests = undefined;
  }
});

test("Nested layouts", function() {
  
  view = Ember.LayoutView.create({
    elementId: 'outer',
    template: Ember.Handlebars.compile("<section>{{yield}}</section>")
  });
  
  var innerView = Ember.LayoutView.create({
    elementId: 'inner',
    template: Ember.Handlebars.compile("<header>{{yield}}</header>")
  });
  
  var contentView = Ember.View.create({
    elementId: 'content',
    template: Ember.Handlebars.compile("<h1>Brogrammer was here</h1>")
  });
  
  view.setPath('yieldContent._default', innerView);
  innerView.setPath('yieldContent._default', contentView);
  
  Ember.run(function() {
    appendView();
  });
  
  var yieldContainer = view.get('_childViews').objectAt(0);
  ok(yieldContainer && yieldContainer instanceof Ember.Handlebars.YieldContainerView, "Yield container should exist.");
  
  var innerYieldContainer = innerView.get('_childViews').objectAt(0);
  ok(innerYieldContainer && innerYieldContainer instanceof Ember.Handlebars.YieldContainerView, "Yield container should exist.")
});

test("Named yield", function() {
  view = Ember.LayoutView.create({
    elementId: 'outer',
    template: Ember.Handlebars.compile("<section>{{yield header}} {{yield}}</section>")
  });
  
  var headerView = Ember.View.create({
    elementId: 'inner',
    template: Ember.Handlebars.compile("<h1>Heads up!</h1>")
  });
  
  view.setPath('yieldContent.header', headerView);
  
  Ember.run(function() {
    appendView();
  });
  
  var headerYieldContainer = view.get('_childViews').objectAt(0);
  ok(headerYieldContainer && headerYieldContainer instanceof Ember.Handlebars.YieldContainerView, "Yield container should exist.");
  
  var yieldContainer = view.get('_childViews').objectAt(1);
  ok(yieldContainer && yieldContainer instanceof Ember.Handlebars.YieldContainerView, "Yield container should exist.");
  
  equals(headerYieldContainer.get('_childViews').objectAt(0), headerView, "named yield container should contain headerView");
  equals(yieldContainer.get('_childViews').get('length'), 0, "default yield should have no content")
});

test("Default contentFor should set content", function() {
  view = Ember.LayoutView.create({
    elementId: 'outer',
    template: Ember.Handlebars.compile("<section><header>{{yield}}</header> {{#contentFor}}<h1>This is some content</h1>{{/contentFor}}</section>")
  });
  
  Ember.run(function() {
    appendView();
  });
  
  ok(/<header>.*<h1>This is some content<\/h1>.*<\/header>/.test(view.$().html()), "content should be correctly set");
  
});



var stateManager;

module('Ember.LayoutState', {
  setup: function() {
    window.TemplateTests = Ember.Namespace.create();
  },

  teardown: function() {
    if (stateManager) stateManager.destroy();
    window.TemplateTests = undefined;
  }
});

test("State re-enter", function() {
  
  stateManager = Ember.StateManager.create({
    rootElement: '#qunit-fixture',
    main: Ember.LayoutState.create({
      view: Ember.LayoutView.create({
        elementId: 'main',
        template: Ember.Handlebars.compile("<div>{{yield}}</div>")
      }),
      section1: Ember.LayoutState.create({
        view: Ember.LayoutView.create({
          elementId: 'section1',
          template: Ember.Handlebars.compile("<section>{{yield}}</section>")
        }),
        content: Ember.LayoutState.create({
          view: Ember.View.create({
            elementId: 'content',
            template: Ember.Handlebars.compile("<p>This is some content</p>")
          }),
        })
      }),
      
      section2: Ember.LayoutState.create({
        view: Ember.View.create({
          elementId: 'section2',
          template: Ember.Handlebars.compile("<h2>Section 2</h2>")
        }),
      })

    })
  });
  
  Ember.run(function() {
    stateManager.goToState('main.section1.content');
  });
  
  ok(stateManager.main.section1.content.active, 'State is acive.');
  
  Ember.run(function() {
    stateManager.goToState('main.section2');
  });
  
  ok(stateManager.main.section2.active, 'State is acive.');
  
  Ember.run(function() {
    stateManager.goToState('main.section1.content');
  });
  
  ok(stateManager.main.section1.content.active, 'State is acive.');
  
});









