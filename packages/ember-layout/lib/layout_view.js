var get = Ember.get, set = Ember.set, meta = Ember.meta;

Ember.LayoutView = Ember.View.extend({
  
  yieldContent: null,
  
  init: function() {
    this._super();
    set(this, 'yieldContent', Ember.Object.create());
  }
  
});
