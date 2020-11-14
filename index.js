'use strict';

module.exports = {
  name: require('./package').name,
  treeForAddon() {
    const Funnel = require('broccoli-funnel');

    const addon = this.addons.find(addon => addon.name === 'ember-cli-babel');
    const vendorTree = new Funnel('vendor');
    return addon.transpileTree(vendorTree);
  }
};
