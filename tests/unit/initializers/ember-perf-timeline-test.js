import {
  instrumentationsFromSearch,
  renderComponentTimeString,
  renderOutletTimeString,
} from 'ember-perf-timeline/initializers/ember-perf-timeline';
import { module, test } from 'qunit';

module('Unit | Initializer | ember perf timeline', function() {
  test('renderComponentTimeString', function(assert) {
    const initialRenderPayload = {
      object: '<component>',
      initialRender: true,
    };
    const updateRenderPayload = {
      object: '<component>',
      initialRender: false,
    };

    assert.equal(
      renderComponentTimeString(initialRenderPayload),
      'EmberRender:<component> (Rendering initial)',
      'initial render string is correct'
    );

    assert.equal(
      renderComponentTimeString(updateRenderPayload),
      'EmberRender:<component> (Rendering update)',
      'update render string is correct'
    );
  });

  test('renderOutletTimeString', function(assert) {
    const initialRenderPayload = {
      object: 'application:main',
    };

    assert.equal(
      renderOutletTimeString(initialRenderPayload),
      'EmberRender:application:main (Rendering outlet)',
      'initial render string is correct'
    );
  });

  test('instrumentationsFromSearch', function(assert) {
    assert.equal(
      instrumentationsFromSearch(''),
      '',
      'Empty search returns empty'
    );
    assert.equal(
      instrumentationsFromSearch('?a=1'),
      '',
      'Without _ember-perf-timeline returns empty'
    );
    assert.equal(
      instrumentationsFromSearch('?_ember-perf-timeline=true&a=1'),
      'true',
      'returns value'
    );
    assert.equal(
      instrumentationsFromSearch(
        '?_ember-perf-timeline=render.component,render.outlet&a=1'
      ),
      'render.component,render.outlet',
      'returns value separated by ,'
    );
    assert.equal(
      instrumentationsFromSearch('?a=1&_ember-perf-timeline=false'),
      'false',
      'returns value when not at first param'
    );
  });
});
