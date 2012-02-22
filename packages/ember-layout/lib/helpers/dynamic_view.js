var get = Ember.get, set = Ember.set, meta = Ember.meta;

/**
  @class
  This is an extension of Ember.ContainerView who's content
  is restricted to a single child dicated by a property
  on another view.
 */
Ember.Handlebars.FrameView = Ember.ContainerView.extend({
  /**
    The view corresponding to the containing template
   */
  blockContainer: null,
  
  /**
    The property on the blockContainer which dictates the
    contents of this container.
   */
  childPath: 'content',
  
  /**
    Set up the listener on the view corresponding to the
    containing template
   */
  init: function() {
    this._super();
    var blockContainer = get(this, 'blockContainer');
    blockContainer.addObserver(get(this, 'childPath'), this, 'contentDidUpdate');
    this.contentDidUpdate();
  },
  
  /** @private
    Fired when the property specified by contentPath changes on
    the blockContainer
   */
  contentDidUpdate: function() {
    var blockContainer = this.get('blockContainer');
    var view = blockContainer.getPath(get(this, 'childPath'));
    ember_assert(view instanceof Ember.View, "dynamicView's content must be set to a subclass of Ember.View'");
    var childViews = this.get('_childViews');
    var len = childViews.get('length');
    var views = view ? [view] : [];
    childViews.replace(0, len, views);
  },
  
  destroy: function() {
    this._super();
    var blockContainer = get(this, 'blockContainer');
    blockContainer.removeObserver(get(this, 'childPath'), this, 'contentDidUpdate');
  }
});

Ember.Handlebars.dynamicViewHelper = Ember.Object.create({

  findContainingBlock: function(view) {
    if (!view) {
      return view;
    }
    // We are using _parentView here, because we need to go through the virtual YieldViews, so we can treat them differently.
    else if (view instanceof Ember.Handlebars.FrameView) {
      var blockContainer = Ember.get(view, 'blockContainer');
      return this.findContainingBlock(Ember.get(blockContainer, '_parentView'));
    }
    else if (view.isVirtual) {
      return this.findContainingBlock(Ember.get(view, '_parentView'));
    }
    return view;
  },

  helper: function(name, options) {
    // If no name is provided, use default and swap parameters
    if (name && name.data && name.data.isRenderData) {
      options = name;
      name = false;
    }
      
    var blockContainer = Ember.Handlebars.dynamicViewHelper.findContainingBlock(options.data.view);
    
    if(name) {
      options.hash.childPath = name;
    }
    options.hash.blockContainer = blockContainer;
    return Ember.Handlebars.helpers.view.call(this, 'Ember.Handlebars.FrameView', options);
  }
  
});

Ember.Handlebars.registerHelper('dynamicView', Ember.Handlebars.dynamicViewHelper.helper);


