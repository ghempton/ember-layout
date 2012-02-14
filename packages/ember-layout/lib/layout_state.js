var get = Ember.get, set = Ember.set;

Ember.LayoutState = Ember.State.extend({
  active: false,
  isViewState: true,
  contentKey: '_default',
  
  init: function() {
    // This is currently experimental. We allow
    // the view itself to define it's substates
    // for better encapsulation. To do this, set
    // the layoutStates property.
    var viewClass = get(this, 'viewClass');
    if(viewClass) {
      var layoutStates = get(viewClass, 'proto').layoutStates;
      set(this, 'states', layoutStates);
    }
    
    this._super();
  },

  enter: function(stateManager, transition) {
    this._super(stateManager, transition);
    
    set(this, 'active', true);
    
    var viewClass = get(this, 'viewClass'), view;
    ember_assert('view cannot be set directly, use viewClass instead', !this.get('view'));
    ember_assert('viewClass must extend Ember.View', Ember.View.detect(viewClass));
    view = this.createView(stateManager, transition);
    this.set('view', view);
    
    if (view) {
      ember_assert('view must be an Ember.View', view instanceof Ember.View);

      // if there is another layout state in the hierarchy, we set
      // the yieldContent of it's layout
      var layout = this.get('layout') || stateManager.get('rootLayout');
      if(layout) {
        var yieldContent = layout.get('yieldContent');
        if(!yieldContent) debugger;
        yieldContent.set(this.contentKey, view);
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

    var layout = this.get('layout') || stateManager.get('rootLayout');
    if(layout) {
      var yieldContent = layout.get('yieldContent');
      yieldContent.set(this.contentKey, null);
    }
    else {
      view.remove();
    }
    set(this, 'view', null);
    set(this, 'active', false);
    this._super(stateManager, transition);
  },
  
  // Called during state entry. Creates the view
  // that will be displayed. Can be overridden
  // to initialize the view
  createView: function(stateManager, transition) {
    return this.get('viewClass').create();
  },
    
  // Recursively find the first parent state with a layout
  layout: Ember.computed(function() {
    var state = this.get('parentState');
    while(state && !state.get('view') && !(state.get('view') instanceof Ember.LayoutView)) {
      state = state.get('parentState');
    }
    return state && state.get('view');
  }).property()
});
