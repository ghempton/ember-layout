var get = Ember.get, set = Ember.set;

/**
  @class
  A convenient extension of Ember.State which makes it easy
  to swap out dynamic content during state transitions.
 */
Ember.LayoutState = Ember.State.extend({
  /**
    Convenience property to bind to.
   */
  active: false,
  
  isViewState: true,
  
  /**
    The property to set in the nearest parent view
    when this state is entered.
   */
  contentPath: 'content',
  
  init: function() {
    // This is currently experimental. We allow
    // the view itself to define it's substates
    // for better encapsulation. To do this, set
    // the layoutStates property.
    var viewClass = get(this, 'viewClass');
    if(viewClass) {
      var layoutStates = viewClass.proto().layoutStates;
      set(this, 'states', layoutStates);
    }
    
    this._super();
  },

  enter: function(stateManager, transition) {
    this._super(stateManager, transition);
    
    set(this, 'active', true);
    
    var viewClass = get(this, 'viewClass'), view;
    Ember.assert('view cannot be set directly, use viewClass instead', !this.get('view'));
    view = this.createView(stateManager, transition);
    this.set('view', view);
    
    if (view) {
      Ember.assert('view must be an Ember.View', view instanceof Ember.View);

      // if there is another view in the hierarchy then
      // set its content
      var parentView = get(this, 'parentView') || get(stateManager, 'rootView');
      if(parentView) {
        Ember.setPath(parentView, get(this, 'contentPath'), view);
      }
      // otherwise we just append to the rootElement on the
      // state manager
      else {
        var root = stateManager.get('rootElement') || 'body';
        view.appendTo(root);
      }
    }
  },

  exit: function(stateManager, transition) {
    var view = get(this, 'view');

    var parentView = get(this, 'parentView') || get(stateManager, 'rootView');
    if(parentView) {
      Ember.setPath(parentView, get(this, 'contentPath'), null);
    }
    else {
      view.remove();
    }
    view.destroy();
    set(this, 'view', null);
    set(this, 'active', false);
    this._super(stateManager, transition);
  },
  
  /**
    Instantiates viewClass. This method can be
    overridden.
   */
  createView: function(stateManager, transition) {
    var viewClass = get(this, 'viewClass');
    Ember.assert('viewClass must extend Ember.View', Ember.View.detect(viewClass));
    return viewClass.create();
  },
    
  /**
    Recursively find the nearest parent view
    in the state hierarchy
   */
  parentView: Ember.computed(function() {
    var state = this.get('parentState');
    while(state && !state.get('view')) {
      state = state.get('parentState');
    }
    return state && state.get('view');
  }).property()
});
