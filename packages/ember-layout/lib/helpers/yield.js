Ember.Handlebars.YieldContainerView = Ember.ContainerView.extend({
  templateContext: null,
  template: null,
  blockContainer: null,
  yieldName: '_default',
  init: function() {
    this._super();
    var layout = this.get('blockContainer');
    var yieldContentPath = 'yieldContent.' + this.yieldName;
    layout.addObserver(yieldContentPath, this, 'contentDidUpdate');
    this.contentDidUpdate();
  },
  contentDidUpdate: function() {
    var layout = this.get('blockContainer');
    var yieldContentPath = 'yieldContent.' + this.yieldName;
    var view = layout.getPath(yieldContentPath);
    var childViews = this.get('_childViews');
    if(!childViews) {
      return;
    }
    var len = childViews.get('length');
    var views = view ? [view] : [];
    childViews.replace(0, len, views);
  }
});

// Ember.Handlebars.YieldView = Ember.View.extend(Ember.Metamorph, {
  // itemViewClass: Ember.View.extend(Ember.Metamorph),
  // templateContext: null,
  // template: null,
  // blockContainer: null   
// });


function findContainingTemplateView(view) {
  // We are using _parentView here, because we need to go through the virtual YieldViews, so we can treat them differently.
  if (!view) {
    return view;
  }
  else if (view instanceof Ember.Handlebars.YieldContainerView) {
    var blockContainer = Ember.get(view, 'blockContainer');
    ember_assert("YieldContainerView representing the current block doesn't have a blockContainer set.", blockContainer);
    return this._findContainingTemplateView(Ember.get(blockContainer, '_parentView'));
  }
  else if (view.isVirtual) {
    return this._findContainingTemplateView(Ember.get(view, '_parentView'));
  }
  else {
    return view;
  }
}

Ember.Handlebars.yieldHelper = Ember.Object.create({

  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = "_default";
    }
      
    var currentView = findContainingTemplateView(options.data.view);
    
    if (currentView && currentView.yieldContent) {
      options.hash.yieldName = name;
      options.hash.blockContainer = currentView;
      return Ember.Handlebars.helpers.view.call(this, 'Ember.Handlebars.YieldContainerView', options);
    }
  }
  
});


Ember.Handlebars.contentForHelper = Ember.Object.create({
  
  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = "_default";
    }
    
    var currentView = findContainingTemplateView(options.data.view);
    
    if (currentView && currentView.yieldContent) {
      // options.hash.templateContext = Ember.mixin(currentView.templateContext, options.hash);
      options.hash.blockContainer = currentView;
  
      // We pass this proxy into the default view helper
      // to conform to the convention of assigning the
      // yieldContent value rather than appending as a child
      var viewProxy = Ember.Object.create({
        appendChild: function(view, options) {
          view = view.create(options);
          currentView.setPath('yieldContent.' + name, view);
        }
      });
      
      options.data.view = viewProxy;
      
      Ember.Handlebars.helpers.view.call(this, 'Ember.View', options);
    }
  }
  
})

Ember.Handlebars.registerHelper('yield', Ember.Handlebars.yieldHelper.helper);
Ember.Handlebars.registerHelper('contentFor', Ember.Handlebars.contentForHelper.helper);