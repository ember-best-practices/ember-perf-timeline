import require, { has } from 'require';
import Mixin from '@ember/object/mixin';
import Component from '@ember/component';
import Evented from '@ember/object/evented';
import Ember from 'ember';
import { configEnv } from 'ember-env-macros';

export function renderComponentTimeString(payload) {
  return `EmberRender:${payload.object} (Rendering ${
    payload.initialRender ? 'initial' : 'update'
  })`;
}

export function renderOutletTimeString(payload) {
  return `EmberRender:${payload.object} (Rendering outlet)`;
}

export function renderGetComponentDefinitionTimeString(payload) {
  return `EmberRender:${payload.object} (Rendering getComponentDefinition)`;
}

export function instrumentationsFromSearch(search) {
  const [searchParam] = search
    .substring(1)
    .split('&')
    .filter(x => x.indexOf('_ember-perf-timeline') > -1);
  const [, instrumentations] = (searchParam && searchParam.split('=')) || [];
  return instrumentations || '';
}

const HAS_PERFORMANCE_OBSERVER = typeof PerformanceObserver !== 'undefined';

const HAS_PERFORMANCE_API =
  typeof performance !== 'undefined' &&
  typeof performance.mark === 'function' &&
  typeof performance.measure === 'function';

function startMark(label) {
  if (HAS_PERFORMANCE_API) {
    performance.mark(`${label}-start`);
  } else {
    // eslint-disable-next-line
    console.time(label);
  }
}

if (HAS_PERFORMANCE_OBSERVER) {
  const marks = Object.create(null);
  const NAME_REGEXP = /(EmberRender:.*)-(start|end)$/;

  new PerformanceObserver(list => {
    for (let { name } of list.getEntries()) {
      const matched = name.match(NAME_REGEXP);
      if (matched) {
        const [, label, startOrStop] = matched;
        const current = (marks[label] = marks[label] || {
          start: false,
          end: false,
        });
        current[startOrStop] = true;
        if (current.start && current.end) {
          performance.measure(label, label + '-start', label + '-end');
          delete marks[label];
        }
      }
    }
  }).observe({ entryTypes: ['mark'] });
}

function endMark(label) {
  if (HAS_PERFORMANCE_API) {
    let startMark = `${label}-start`;
    let endMark = `${label}-end`;
    performance.mark(endMark);
    if (HAS_PERFORMANCE_OBSERVER === false) {
      performance.measure(label, startMark, endMark);
    }
  } else {
    // eslint-disable-next-line
    console.timeEnd(label);
  }
}

const hasLocation =
  typeof self !== 'undefined' && typeof self.location === 'object';

if (hasLocation) {
  const instrumentations = instrumentationsFromSearch(self.location.search);
  const ENABLE_ALL = instrumentations === 'true';

  const RENDER_COMPONENT =
    configEnv('emberPerfTimeline.renderComponent') ||
    ENABLE_ALL ||
    instrumentations.indexOf('render.component') > -1;
  const RENDER_OUTLET =
    configEnv('emberPerfTimeline.renderOutlet') ||
    ENABLE_ALL ||
    instrumentations.indexOf('render.outlet') > -1;
  const RENDER_GET_COMPONENT_DEFINITION =
    configEnv('emberPerfTimeline.renderGetComponentDefinition') ||
    ENABLE_ALL ||
    instrumentations.indexOf('render.getComponentDefinition') > -1;

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
    },
  });

  /* eslint-enable ember/no-new-mixins  */
  Component.reopen(TriggerMixin);
  Evented.reopen(TriggerMixin);

  if (has('ember-data/index')) {
    const Model = require('ember-data/index').default.Model;
    Model.reopen(TriggerMixin);
  }

  if (RENDER_COMPONENT) {
    Ember.subscribe('render.component', {
      before: function $beforeRenderComponent(eventName, time, payload) {
        startMark(renderComponentTimeString(payload));
      },
      after: function $afterRenderComponent(eventName, time, payload) {
        endMark(renderComponentTimeString(payload));
      },
    });
  }

  if (RENDER_OUTLET) {
    Ember.subscribe('render.outlet', {
      before: function $beforeRenderComponent(eventName, time, payload) {
        startMark(renderOutletTimeString(payload));
      },
      after: function $afterRenderComponent(eventName, time, payload) {
        endMark(renderOutletTimeString(payload));
      },
    });
  }

  if (RENDER_GET_COMPONENT_DEFINITION) {
    Ember.subscribe('render.getComponentDefinition', {
      before: function $beforeRenderComponent(eventName, time, payload) {
        startMark(renderGetComponentDefinitionTimeString(payload));
      },
      after: function $afterRenderComponent(eventName, time, payload) {
        endMark(renderGetComponentDefinitionTimeString(payload));
      },
    });
  }
}

export default {
  name: 'ember-perf-timeline',
  initialize() {},
};
