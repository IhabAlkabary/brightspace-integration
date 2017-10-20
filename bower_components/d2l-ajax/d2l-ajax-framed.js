'use strict';

var jwt = require('frau-jwt/framed');

Polymer({
	is: 'd2l-ajax-framed',
	properties: {
		auto: Boolean,
		url: {
			type: Object,
			value: null
		},
		params: {
			type: Object,
			value: function() {
				return {};
			}
		},
		method: {
			type: String,
			value: 'GET'
		},
		headers: {
			type: Object,
			value: function() {
				return {};
			}
		},
		contentType: String,
		body: {
			type: Object,
			value: null
		},
		handleAs: String,
		withCredentials: Boolean,
		timeout: Number,
		lastResponse: {
			type: Object,
			notify: true
		},
		lastError: {
			type: Object,
			notify: true
		},
		scope: {
			type: String,
			value: '*:*:*'
		},
		authToken: {
			type: String,
			value: function() {
				return null;
			}
		},
		debounceDuration: {
			type: Number,
			value: 0,
			notify: true
		}
	},
	observers: [
		'_requestOptionsChanged(url, params.*, body, auto)'
	],
	computeHeaders: function(headers, authToken) {
		var result = {},
			header;

		if (authToken) {
			result.Authorization = 'Bearer ' + authToken;
		}

		if (headers instanceof Object) {
			for (header in headers) {
				result[header] = headers[header].toString();
			}
		}

		return result;
	},
	generateRequest: function() {
		return jwt(this.scope)
			.then(function(token) {
				this.authToken = token;
				return this.$$('iron-ajax').generateRequest().completes;
			}.bind(this),
			function(e){
				this.onError(e);
				return Promise.reject(e);
			}.bind(this));
	},
	onError: function(e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		var data = e;
		if (e && e.detail) {
			data = e.detail;
		}
		this.fire('iron-ajax-error', data);
	},
	onRequest: function(e) {
		e.stopPropagation();
		this.fire('iron-ajax-request', e.detail);
	},
	onResponse: function(e) {
		e.stopPropagation();
		this.fire('iron-ajax-response', e.detail);
	},
	_requestOptionsChanged: function() {
		if (this.url == null) {
			return;
		}
		if (this.auto) {
			this.generateRequest();
		}
	}
});
