## Ember Layout

Provides an intuitive layout mechanism for [Ember.js](http://emberjs.com).

### Example Layout

Code for the view:

```
App.layout = Ember.LayoutView.create({
  templateName: 'main-layout'
});

```

Associated template:

```
<section>
  <header>
    {{yield header}}
  </header>
  
  <div id="content">
    {{yield}}
  </div>
</section>
```

The `{{yield}}` regions of the layout can now be dynamically populated by child templates or in code:

```
App.headerView = Ember.View.create( ... );
App.layout.setPath('yieldContent.header', headerView);
```

Or in the template of a child view:

```
{{#contentFor header}}
  <h2>This is part of the header</h2>
{{#/content}}

This is in the main content.
```

### Layout States

Ember.Layout also integrates with Ember's StateManager (and consequently, [Ember.RouteManager](https://github.com/ghempton/ember-routemanager)):

```
App.stateManager = Ember.StateManager.create({
  rootLayout = App.layout,
  section1: Ember.LayoutState.create({
    view: App.section1
  }),
  section2: Ember.LayoutState.create({
    view: App.section2
  })
})

App.stateManager.goToState('section1');
```

