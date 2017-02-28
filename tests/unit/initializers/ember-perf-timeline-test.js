import Ember from 'ember';
import {
  renderComponentTimeString, renderOutletTimeString
} from 'ember-perf-timeline/initializers/ember-perf-timeline';
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
    '<component> (Rendering: initial)',
    'initial render string is correct'
  );

  assert.equal(
    renderComponentTimeString(updateRenderPayload),
    '<component> (Rendering: update)',
    'update render string is correct'
  );
});

test('renderOutletTimeString', function(assert) {
  const initialRenderPayload = {
    object: 'application:main',
  };

  assert.equal(
    renderOutletTimeString(initialRenderPayload),
    'application:main (Rendering: outlet)',
    'initial render string is correct'
  );
});
