## Ember Layout

Provides an intuitive layout mechanism for Ember.js.

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
