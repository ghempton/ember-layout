var get = Ember.get, set = Ember.set;

Ember.LayoutState = Ember.State.extend({
  active: false,
  isViewState: true,
  contentKey: '_default',
  
  init: function() {
    var view = get(this, 'view');
    if(view) {
      // Right now all components are bound to the global context
      // var context = get(this, 'context');
      // set(component, 'context', GT.context);
      layoutStates = get(view, 'layoutStates');
      set(this, 'states', layoutStates);
    }
    
    this._super();
  },

  enter: function(stateManager, transition) {
    this._super(stateManager, transition);
    set(this, 'active', true);
    var view = get(this, 'view'), root, childViews;
    
    if (view) {
      ember_assert('view must be an Ember.View', view instanceof Ember.View);

      var ancestor = this.get('ancestor');
      // if there is another component state in the hierarchy,
      // we append to the 'childComponent' view
      if(ancestor) {
        var ancestorView = get(ancestor, 'view');
        var yieldContent = ancestorView.get('yieldContent');
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
    this._super(stateManager, transition);
    var view = get(this, 'view');

    if (view) {
      var ancestor = this.get('ancestor');
      if(ancestor) {
        var ancestorView = get(ancestor, 'view');
        var yieldContent = ancestorView.get('yieldContent');
        yieldContent.set(this.contentKey, null);
      }
      else {
        view.remove();
      }
    }
    set(this, 'active', false);
  },
  
  // Recursively find the first parent layout state
  // with a view to append to
  ancestor: Ember.computed(function() {
    var state = this.get('parentState');
    while(state && !state.get('view')) {
      state = state.get('parentState');
    }
    return state;
  }).property()
});
