import Ember from 'ember';
import { timeString } from 'ember-perf-timeline/initializers/ember-perf-timeline';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';

module('Unit | Initializer | ember perf timeline', {
  beforeEach() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.application.deferReadiness();
    });
  },
  afterEach() {
    destroyApp(this.application);
  }
});

// Replace this with your real tests.
test('timeString', function(assert) {
  const initialRenderPayload = {
    object: '<component>',
    initialRender: true,
  };
  const updateRenderPayload = {
    object: '<component>',
    initialRender: false,
  };

  assert.equal(
    timeString(initialRenderPayload),
    '<component> (Rendering: initial)',
    'initial render string is correct'
  );

  assert.equal(
    timeString(updateRenderPayload),
    '<component> (Rendering: update)',
    'update render string is correct'
  );
});
