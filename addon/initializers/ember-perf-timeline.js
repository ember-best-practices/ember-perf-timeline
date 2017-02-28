import Ember from 'ember';

export function timeString(payload) {
  return `${payload.object} (Rendering: ${payload.initialRender ? 'initial' : 'update' })`;
}

if (/[\?\&]_ember-perf-timeline=true/ig.test(self.location.search)) {
  Ember.subscribe('render.component', {
    before(eventName, time, payload) {
      console.time(timeString(payload));
    },
    after(eventName, time, payload) {
      console.timeEnd(timeString(payload));
    }}
  );
}
export default {
  name: 'ember-perf-timeline',
  initialize() { }
};
