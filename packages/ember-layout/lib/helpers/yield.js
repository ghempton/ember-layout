Ember.Handlebars.YieldContainerView = Ember.ContainerView.extend({
  templateContext: null,
  template: null,
  blockContainer: null,
  yieldName: '_default',
  init: function() {
    this._super();
    var layout = this.get('blockContainer');
    var yieldContent = layout.get('yieldContent');
    yieldContent.addObserver(this.get('yieldName'), this, 'contentDidUpdate');
    this.contentDidUpdate();
  },
  contentDidUpdate: function() {
    var layout = this.get('blockContainer');
    var yieldContent = layout.get('yieldContent');
    var view = yieldContent.get(this.get('yieldName'));
    var childViews = this.get('_childViews');
    var len = childViews.get('length');
    var views = view ? [view] : [];
    childViews.replace(0, len, views);
  },
  destroy: function() {
    this._super();
    var layout = this.get('blockContainer');
    var yieldContent = layout.get('yieldContent');
    yieldContent.removeObserver(this.get('yieldName'), this, 'contentDidUpdate');
  }
});

// Ember.Handlebars.YieldView = Ember.View.extend(Ember.Metamorph, {
  // itemViewClass: Ember.View.extend(Ember.Metamorph),
  // templateContext: null,
  // template: null,
  // blockContainer: null   
// });

// function findContainingLayout(view) {
  // // We are using _parentView here, because we need to go through the virtual YieldViews, so we can treat them differently.
  // if (!view) {
    // return view;
  // }
  // else if (view instanceof Ember.Handlebars.YieldContainerView) {
    // var blockContainer = Ember.get(view, 'blockContainer');
    // ember_assert("YieldContainerView representing the current block doesn't have a blockContainer set.", blockContainer);
    // return this._findContainingTemplateView(Ember.get(blockContainer, '_parentView'));
  // }
  // else if (view.isVirtual) {
    // return this._findContainingTemplateView(Ember.get(view, '_parentView'));
  // }
  // else {
    // return view;
  // }
// }

function findContainingLayout(view) {
  if(!(view instanceof Ember.LayoutView)) {
    view = view.nearestInstanceOf(Ember.LayoutView);
  }
  return view;
}

Ember.Handlebars.yieldHelper = Ember.Object.create({

  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = "_default";
    }
      
    var layout = findContainingLayout(options.data.view);
    
    if (layout) {
      options.hash.yieldName = name;
      options.hash.blockContainer = layout;
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
    
    var layout = findContainingLayout(options.data.view);
    
    if (layout) {
      options.hash.blockContainer = layout;
  
      // We pass this proxy into the default view helper
      // to conform to the convention of assigning the
      // yieldContent value rather than appending as a child
      var viewProxy = Ember.Object.create({
        appendChild: function(view, options) {
          view = view.create(options);
          layout.setPath('yieldContent.' + name, view);
        }
      });
      
      options.data.view = viewProxy;
      
      Ember.Handlebars.helpers.view.call(this, 'Ember.View', options);
    }
  }
  
});

Ember.Handlebars.registerHelper('yield', Ember.Handlebars.yieldHelper.helper);
Ember.Handlebars.registerHelper('contentFor', Ember.Handlebars.contentForHelper.helper);