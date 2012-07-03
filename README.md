**This library has been deprecated. [Please read this blog post](http://codebrief.com/2012/07/anatomy-of-an-ember-dot-js-app-part-i-redux-routing-and-outlets/).**

## Ember Layout

Provides an intuitive layout mechanism for [Ember.js](http://emberjs.com). The core addition is a `{{dynamicView}}` handlebars helper which allows for child views to be dynamically swapped out from anywhere in the template.

### How It Works

The `{{dynamicView}}` binds itself to the `content` property of its containing view. When the content property is set to a subclass of `Ember.View`, the dynamic view helper's contents will be replaced to reflect the new view. This property can be changed at any time. To use a different property, simply specify it as follows: `{{dynamicView propertyName}}`.

### Example Layout

Code for the view:

```
App.layout = Ember.View.create({
  templateName: 'main-layout'
});

```

Associated template:

```
<section>
  <header>
    {{dynamicView header}}
  </header>
  
  <div id="content">
    {{dynamicView}}
  </div>
</section>
```

The `{{dynamicView}}` regions of the view can now be dynamically populated  in code:

```
App.headerView = Ember.View.create( ... );
App.layout.set('header', headerView);
```

In fact, swapping out the view in this example is as simple as setting the `header` or `content` properties of the view. The `content` property is the default name of the property bound by `{{dynamicView}}` if none is specified.

### Layout States

Ember.Layout also integrates with Ember's StateManager (and consequently plays well with [Ember.RouteManager](https://github.com/ghempton/ember-routemanager)):

```
App.stateManager = Ember.StateManager.create({
  rootView: App.layout,
  section1: Ember.LayoutState.create({
    viewClass: App.Section1
  }),
  section2: Ember.LayoutState.create({
    viewClass: App.Section2
  })
})

App.stateManager.goToState('section1');
```

