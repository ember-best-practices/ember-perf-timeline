/* global requirejs */
import Ember from 'ember';

export function renderComponentTimeString(payload) {
  return `${payload.object} (Rendering: ${payload.initialRender ? 'initial' : 'update' })`;
}

export function renderOutletTimeString(payload) {
  return `${payload.object} (Rendering: outlet)`;
}

export function renderGetComponentDefinitionTimeString(payload) {
  return `${payload.object} (Rendering: getComponentDefinition)`;
}

function startMark(label) {
  performance.mark(`${label}-start`);
}

function endMark(label) {
  let startMark = `${label}-start`;
  let endMark = `${label}-end`;
  performance.mark(endMark);
  performance.measure(label, startMark, endMark);
}

let hasLocation = typeof self !== 'undefined' && typeof self.location === 'object';
let shouldActivatePerformanceTracing = hasLocation && /[\?\&]_ember-perf-timeline=true/ig.test(self.location.search);

if (shouldActivatePerformanceTracing) {
  let EVENT_ID = 0;
  // performance.clearMeasures = function() {};

  const TriggerMixin = Ember.Mixin.create({
    trigger(eventName) {
      let eventId = EVENT_ID++;
      let label = `${this._debugContainerKey}:${eventName}`;
      let startMark = `${eventId}-start`;
      let endMark = `${eventId}-end`;
      performance.mark(startMark);
      let ret = this._super.apply(this, arguments);
      performance.mark(endMark);
      performance.measure(label, startMark, endMark);
      return ret;
    }
  });

  Ember.Component.reopen(TriggerMixin);
  Ember.Evented.reopen(TriggerMixin);

  if (requirejs.entries['ember-data/index']) {
    const Model = requirejs('ember-data/index').default.Model;
    Model.reopen(TriggerMixin);
  }

  Ember.subscribe('render.component', {
    before: function $beforeRenderComponent(eventName, time, payload) {
      startMark(renderComponentTimeString(payload));
    },
    after: function $afterRenderComponent(eventName, time, payload) {
      endMark(renderComponentTimeString(payload));
    }}
  );

  Ember.subscribe('render.outlet', {
    before: function $beforeRenderComponent(eventName, time, payload) {
      startMark(renderOutletTimeString(payload));
    },
    after: function $afterRenderComponent(eventName, time, payload) {
      endMark(renderOutletTimeString(payload));
    }}
  );

  Ember.subscribe('render.getComponentDefinition', {
    before: function $beforeRenderComponent(eventName, time, payload) {
      startMark(renderGetComponentDefinitionTimeString(payload));
    },
    after: function $afterRenderComponent(eventName, time, payload) {
      endMark(renderGetComponentDefinitionTimeString(payload));
    }}
  );
}

export default {
  name: 'ember-perf-timeline',
  initialize() { }
};
