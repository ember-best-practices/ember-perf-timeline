/* global requirejs */
import Ember from 'ember';
import ENV_CONFIG from 'ember-get-config';

const IS_DEVELOPMENT = (ENV_CONFIG.environment === 'development');

export function renderComponentTimeString(payload) {
  return `${payload.object} (Rendering: ${payload.initialRender ? 'initial' : 'update' })`;
}

export function renderOutletTimeString(payload) {
  return `${payload.object} (Rendering: outlet)`;
}

export function renderGetComponentDefinitionTimeString(payload) {
  return `${payload.object} (Rendering: getComponentDefinition)`;
}

let HAS_PERFORMANCE_API = false;

function detectPerformanceApi() {
  return typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.measure === 'function';
}

function startMark(label) {
  if (HAS_PERFORMANCE_API) {
    performance.mark(`${label}-start`);
  } else {
    console.time(label);
  }
}

function endMark(label) {
  if (HAS_PERFORMANCE_API) {
    let startMark = `${label}-start`;
    let endMark = `${label}-end`;
    performance.mark(endMark);
    performance.measure(label, startMark, endMark);
  } else {
    console.timeEnd(label);
  }
}

let hasLocation = typeof self !== 'undefined' && typeof self.location === 'object';
let shouldActivatePerformanceTracing = hasLocation && /[\?\&]_ember-perf-timeline=true/ig.test(self.location.search);

if (shouldActivatePerformanceTracing || IS_DEVELOPMENT) {
  HAS_PERFORMANCE_API = detectPerformanceApi();

  let EVENT_ID = 0;

  // prevent folks from force-flushing this queue when we are active
  if (HAS_PERFORMANCE_API) {
    performance.clearMeasures = function() {};
    performance.clearMarks = function() {};
  }

  const TriggerMixin = Ember.Mixin.create({
    trigger(eventName) {
      let eventId = EVENT_ID++;
      let label = `${this.toString()}:${eventName}:${eventId}`;
      startMark(label);
      let ret = this._super.apply(this, arguments);
      endMark(label);
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
