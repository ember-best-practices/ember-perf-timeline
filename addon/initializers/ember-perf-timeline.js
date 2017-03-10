import Ember from 'ember';

export function renderComponentTimeString(payload) {
  return `${payload.object} (Rendering: ${payload.initialRender ? 'initial' : 'update' })`;
}

export function renderOutletTimeString(payload) {
  return `${payload.object} (Rendering: outlet)`;
}

let hasLocation = typeof self !== 'undefined' && typeof self.location === 'object';

if (hasLocation && /[\?\&]_ember-perf-timeline=true/ig.test(self.location.search)) {
  Ember.subscribe('render.component', {
    before: function $beforeRenderComponent(eventName, time, payload) {
      console.time(renderComponentTimeString(payload));
    },
    after: function $afterRenderComponent(eventName, time, payload) {
      console.timeEnd(renderComponentTimeString(payload));
    }}
  );

  Ember.subscribe('render.outlet', {
    before: function $beforeRenderComponent(eventName, time, payload) {
      console.time(renderOutletTimeString(payload));
    },
    after: function $afterRenderComponent(eventName, time, payload) {
      console.timeEnd(renderOutletTimeString(payload));
    }}
  );
}

export default {
  name: 'ember-perf-timeline',
  initialize() { }
};
