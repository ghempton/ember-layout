var stateManager, view;

var appendView = function(v) {
  v = v || view;
  Ember.run(function() { v.appendTo('#qunit-fixture'); });
};

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

test("should respect stateManager.rootLayout", function() {
  view = Ember.View.create({
    template: Ember.Handlebars.compile('<div id="content">{{dynamicView}}</div>')
  });
  
  Ember.run(function() {
    appendView();
  });
  
  stateManager = Ember.StateManager.create({
    rootView: view,
    main: Ember.LayoutState.create({
      viewClass: Ember.View.extend({
        template: Ember.Handlebars.compile("<p>This is some content.</p>")
      })
    })
  });
  
  Ember.run(function() {
    stateManager.goToState('main');
  });
  
  console.log(view.$().html())
  
  ok(/<p>This is some content.<\/p>/.test(view.$().html()), "content should be inserted.");
});

test("should re-enter states succesfully", function() {
  
  stateManager = Ember.StateManager.create({
    rootElement: '#qunit-fixture',
    main: Ember.LayoutState.create({
      viewClass: Ember.View.extend({
        elementId: 'main',
        template: Ember.Handlebars.compile("<div>{{dynamicView}}</div>")
      }),
      section1: Ember.LayoutState.create({
        viewClass: Ember.View.extend({
          elementId: 'section1',
          template: Ember.Handlebars.compile("<section>{{dynamicView}}</section>")
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

test("views can set sub-states using the layoutState property", function() {
  
  var Main = Ember.View.extend({
    elementId: 'main',
    template: Ember.Handlebars.compile("<div>{{dynamicView}}</div>"),
    layoutStates: Ember.Object.create({
      section1: Ember.LayoutState.create({
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

test("view should be destroyed", function() {
  
  var sectionView = null;
  var contentView = null;
  
  stateManager = Ember.StateManager.create({
    rootElement: '#qunit-fixture',
    main: Ember.LayoutState.create({
      viewClass: Ember.View.extend({
        elementId: 'main',
        template: Ember.Handlebars.compile("<div>{{dynamicView}}</div>")
      }),
      section1: Ember.LayoutState.create({
        exit: function(stateManager, transition) {
          sectionView = this.get('view');
          this._super();
        },
        viewClass: Ember.View.extend({
          elementId: 'section1',
          template: Ember.Handlebars.compile("<section>{{dynamicView}}</section>")
        }),
        content: Ember.LayoutState.create({
          exit: function(stateManager, transition) {
            contentView = this.get('view');
            this._super();
          },
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
  
  Ember.run(function() {
    stateManager.goToState('main.section1.content');
  });
  
  Ember.run(function() {
    stateManager.goToState('main.section2');
  });
  
  ok(sectionView.isDestroyed, 'view should be destroyed');
  ok(contentView.isDestroyed, 'view should be destroyed');
    
});
