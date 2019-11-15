import require from 'require';
import Mixin from '@ember/object/mixin';
import Component from '@ember/component';
import Evented from '@ember/object/evented';
import Ember from 'ember';

export function renderComponentTimeString(payload) {
  return `EmberRender:${payload.object} (Rendering ${payload.initialRender ? 'initial' : 'update' })`;
}

export function renderOutletTimeString(payload) {
  return `EmberRender:${payload.object} (Rendering outlet)`;
}

export function renderGetComponentDefinitionTimeString(payload) {
  return `EmberRender:${payload.object} (Rendering getComponentDefinition)`;
}

let HAS_PERFORMANCE_API = false;
const hasPerformanceObserver = typeof PerformanceObserver !== 'undefined';

function detectPerformanceApi() {
  return typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.measure === 'function';
}

function startMark(label) {
  if (HAS_PERFORMANCE_API) {
    performance.mark(`${label}-start`);
  } else {
  // eslint-disable-next-line
    console.time(label);
  }
}


if (hasPerformanceObserver) {
  const marks = Object.create(null);
  const NAME_REGEXP = /(EmberRender:.*)-(start|end)$/;

  new PerformanceObserver(list => {
    for (let { name } of list.getEntries()) {
      const matched = name.match(NAME_REGEXP);
      if (matched) {
        const [, label, startOrStop] = matched;
        const current = marks[label] = marks[label] || {
          start: false,
          end: false
        };
        current[startOrStop] = true
        if (current.start && current.end) {
          performance.measure(label, label + '-start', label + '-end');
          delete marks[label];
        }
      }
    }
  }).observe({ entryTypes: ['mark']});
}

function endMark(label) {
  if (HAS_PERFORMANCE_API) {
    let startMark = `${label}-start`;
    let endMark = `${label}-end`;
    performance.mark(endMark);
    if (hasPerformanceObserver === false) {
      performance.measure(label, startMark, endMark);
    }
  } else {
    // eslint-disable-next-line
    console.timeEnd(label);
  }
}

let hasLocation = typeof self !== 'undefined' && typeof self.location === 'object';
let shouldActivatePerformanceTracing = hasLocation && /[?&]_ember-perf-timeline=true/ig.test(self.location.search);

if (shouldActivatePerformanceTracing) {
  HAS_PERFORMANCE_API = detectPerformanceApi();

  let EVENT_ID = 0;

  // prevent folks from force-flushing this queue when we are active
  if (HAS_PERFORMANCE_API) {
    performance.clearMeasures = function() {};
    performance.clearMarks = function() {};
  }

  /* eslint-disable ember/no-new-mixins  */
  const TriggerMixin = Mixin.create({
    trigger(eventName) {
      let eventId = EVENT_ID++;
      let label = `EmberRender:${this.toString()}.${eventName}.${eventId}`;
      startMark(label);
      let ret = this._super.apply(this, arguments);
      endMark(label);
      return ret;
    }
  });
  /* eslint-enable ember/no-new-mixins  */

  Component.reopen(TriggerMixin);
  Evented.reopen(TriggerMixin);

  /* global requirejs*/
  if (requirejs.entries['ember-data/index']) {
    const Model = require('ember-data/index').default.Model;
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
