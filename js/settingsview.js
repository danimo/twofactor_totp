/* global Backbone, Handlebars */

(function (OC, Backbone, Handlebars, $) {
    'use strict';

    OC.Settings = OC.Settings || {};
    OC.Settings.TwoFactorTotp = OC.Settings.TwoFactorTotp || {};

    var TEMPLATE = '<div>'
            + '    <input type="checkbox" class="checkbox" id="totp-enabled">'
            + '    <label for="totp-enabled">' + t('twofactor_totp', 'Enable TOTP') + '</label>'
            + '</div>'
            + '{{#if secret}}'
			+ '<div>'
			+ '    <span>' + t('twofactor_totp', 'This is your new TOTP secret:') + ' {{secret}}</span>'
			+ '</div>'
            + '<div>'
            + '    <span>' + t('twofactor_totp', 'Scan this QR code with your TOTP app') + '<span><br>'
            + '    <img src="{{qr}}">'
            + '    </div>'
            + '{{/if}}';

    var View = Backbone.View.extend({
        template: Handlebars.compile(TEMPLATE),
        _loading: undefined,
        _enabled: undefined,
        events: {
            'change #totp-enabled': '_onToggleEnabled'
        },
        initialize: function () {
            this._load();
        },
        render: function (data) {
            this.$el.html(this.template(data));
        },
        _load: function () {
            this._loading = true;

            var url = OC.generateUrl('/apps/twofactor_totp/settings/state');
            var loading = $.ajax(url, {
                method: 'GET',
            });

            var _this = this;
            $.when(loading).done(function (data) {
                _this._enabled = data.enabled;
                _this.$('#totp-enabled').attr('checked', data.enabled);
            });
            $.when(loading).always(function () {
                _this._loading = false;
            });
        },
        _onToggleEnabled: function () {
            if (this._loading) {
                // Ignore event
                return;
            }

            var enabled = this.$('#totp-enabled').is(':checked');

            if (enabled !== this._enabled) {
                this._loading = true;
                var url = OC.generateUrl('/apps/twofactor_totp/settings/enable');
                var updating = $.ajax(url, {
                    method: 'POST',
                    data: {
                        state: enabled
                    }
                });

                var _this = this;
                $.when(updating).done(function(data) {
                    _this._enabled = data.enabled;
                    _this._showQr(data);
                    _this.$('#totp-enabled').attr('checked', data.enabled);
                });
                $.when(updating).always(function () {
                    _this._loading = false;
                });
                this._enabled = enabled;
            }
        },
        _showQr: function(data) {
            this.render({
				secret: data.secret,
                qr: data.qr
            });
        }
    });

    OC.Settings.TwoFactorTotp.View = View;

})(OC, Backbone, Handlebars, $);