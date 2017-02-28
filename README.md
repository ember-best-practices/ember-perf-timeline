# ember-perf-timeline

![timeline example](https://raw.githubusercontent.com/stefanpenner/ember-perf-timeline/master/assets/travis.png)

Add timeline information for ember apps.


*note: Currently we provide information for component render, although more support can (and should) be added*

## Installation

* `ember install ember-perf-timeline`

## Usage

1. add `_ember-perf-timeline=true` to the queryString of your URL.
2. record a timeline (timeline tab or performance tab in chrome)

*note: if the queryParam is not set, the addon will not impact your app's performance, and can be left installed for production*
*note: if the queryParam is set, the instrumentation overhead may be a tad high for now*

## Example

1. run `ember s` in this repo
2. visit [http://localhost:4202/?_ember-perf-timeline=true](http://localhost:4202/?_ember-perf-timeline=true)
3. open "Timeline" or "Performace" tab in the inspector
4. click the checkbox
5. you will see:

![update and create of components on render](https://raw.githubusercontent.com/stefanpenner/ember-perf-timeline/master/assets/update-and-create-render.png)

### What else can you do?

1. you can search by the name of your component:

![timeline search](https://raw.githubusercontent.com/stefanpenner/ember-perf-timeline/master/assets/timeilne-search.png)

2. You can search for both `$beforeRenderComponent` and `$afterRenderComponent`, to find the bounds of component renderings within the flame graph

![searched keywords may be hard to find](https://raw.githubusercontent.com/stefanpenner/ember-perf-timeline/master/assets/before-render-component-can-be-hard-to-find.png)

note: searching is limited to the visibile portion of the timeline

# Developement

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
