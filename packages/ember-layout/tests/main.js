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

test("Children contentFor helpers should set parent layout yields", function() {
  view = Ember.LayoutView.create({
    template: Ember.Handlebars.compile('<section><header>{{yield header}}</header><div id="content">{{yield}}</div></section>')
  });
  
  var innerView = Ember.View.create({
    template: Ember.Handlebars.compile('{{#contentFor header}}Brain{{/contentFor}}Torso')
  });
  
  view.setPath('yieldContent._default', innerView);
  
  Ember.run(function() {
    appendView();
  });
  
  ok(/<header>.*Brain.*<\/header>.*Torso.*/.test(view.$().html()), "content should be correctly set");
  
  debugger;
});


var stateManager;

module('Ember.LayoutState', {
  setup: function() {
    window.TemplateTests = Ember.Namespace.create();
  },

  teardown: function() {
    if (stateManager) stateManager.destroy();
    if (view) view.destroy();
    window.TemplateTests = undefined;
    
  }
});

test("Should respect stateManager.rootLayout", function() {
  view = Ember.LayoutView.create({
    template: Ember.Handlebars.compile('<div id="content">{{yield}}</div>')
  });
  
  Ember.run(function() {
    appendView();
  });
  
  stateManager = Ember.StateManager.create({
    rootLayout: view,
    main: Ember.LayoutState.create({
      viewClass: Ember.LayoutView.extend({
        template: Ember.Handlebars.compile("<p>This is some content.</p>")
      })
    })
  });
  
  Ember.run(function() {
    stateManager.goToState('main');
  });
  
  ok(/<p>This is some content.<\/p>/.test(view.$().html()), "content should be inserted.");
});

test("Should re-enter states succesfully", function() {
  
  stateManager = Ember.StateManager.create({
    rootElement: '#qunit-fixture',
    main: Ember.LayoutState.create({
      viewClass: Ember.LayoutView.extend({
        elementId: 'main',
        template: Ember.Handlebars.compile("<div>{{yield}}</div>")
      }),
      section1: Ember.LayoutState.create({
        viewClass: Ember.LayoutView.extend({
          elementId: 'section1',
          template: Ember.Handlebars.compile("<section>{{yield}}</section>")
        }),
        content: Ember.LayoutState.create({
          viewClass: Ember.View.extend({
            elementId: 'content',
            template: Ember.Handlebars.compile("<p>This is some content</p>"),
            destroy: function() {
              this._super()
            }
          }),
        })
      }),
      
      section2: Ember.LayoutState.create({
        viewClass: Ember.View.extend({
          elementId: 'section2',
          template: Ember.Handlebars.compile("<h2>Section 2</h2>")
        }),
      })

    })
  });
  
  
  for(var i = 0; i < 3; i++) {
    Ember.run(function() {
      stateManager.goToState('main.section1.content');
    });
    
    ok(stateManager.main.section1.content.active, 'section1 state is acive');
    ok(/.*This is some content.*/.test($('#qunit-fixture').html()), "section1 content should be set correctly");
    
    Ember.run(function() {
      stateManager.goToState('main.section2');
    });
    
    ok(stateManager.main.section2.active, 'section2 state is acive');
    ok(/.*Section 2.*/.test($('#qunit-fixture').html()), "section2 content should be set correctly");
  }
  
});

test("LayoutViews can set sub-states using the layoutState property", function() {
  
  var Main = Ember.LayoutView.extend({
    elementId: 'main',
    template: Ember.Handlebars.compile("<div>{{yield}}</div>"),
    layoutStates: Em.Object.create({
      section1: Em.LayoutState.create({
        viewClass: Ember.View.extend({
          template: Ember.Handlebars.compile("Section 1")
        })
      })
    })
  });
  
  stateManager = Ember.StateManager.create({
    rootElement: '#qunit-fixture',
    main: Ember.LayoutState.create({
      viewClass: Main
    })
  });
  
  Ember.run(function() {
    stateManager.goToState('main.section1');
  });
  
  ok(stateManager.main.states.section1.active, 'section1 state is acive');
  ok(/.*Section 1*/.test($('#qunit-fixture').html()), "section1 content should be set correctly");
  
});









