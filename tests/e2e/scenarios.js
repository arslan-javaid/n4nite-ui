/* global browser, expect */

'use strict';

describe('AngularJS Template', function () {
    var page = require('./pages/page.js');

    it('should automatically redirect to /node when location hash/fragment is empty', function () {
        page.getHomepage();
        expect(page.getLocation()).toEqual('/node');
    });

    it('should display name, version and author of app in footer ', function () {
        page.getHomepage();
        expect(page.getAppFooter()).toEqual('AngularJS Template app v0.0.4 by Michal Pietrzak');
    });

});
