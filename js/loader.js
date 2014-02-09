define(
	'loader',
	['jquery', 'underscore'],
	function($, _) {
		return {
			model: null,

			errorCode: null,

			errorMessage: 'Unknown error',

			selectors: {
				input: '.search :text',
				button: '.search :button'
			},

			proxyUrl: '/proxy.php',

			parseUrl: _.template('http://megavisor.com/export/<%= type %>.json?uuid=<%= id %>'),

			getUrl: function(url) {
				url = $.trim(url);

				if (/.*\/([a-z]+)\/([\d]+)\/?$/g.test(url)) {
					return this.parseUrl({
						type: RegExp.$1,
						id: RegExp.$2
					});
				} else {
					this.errorMessage = 'Bad request';
					this.onError();
				}
			},

			load: function() {
				var jsonUrl = this.getUrl( $(this.selectors.input).val() );
				$.getJSON(this.proxyUrl, {url: jsonUrl}, function(data) {
					if (this.validate(data)) {
						this.model = data;
						this.onLoad();
					} else {
						this.onError();
					}
				}.bind(this));
			},

			validate: function(data) {
				var self = this;

				if (!$.isPlainObject(data)) {
					self.errorCode = 400;
					self.errorMessage = 'Bad request';
					return false;
				}

				if (data.errors instanceof Array) {
					_.each(data.errors, function(error) {
						if ($.isPlainObject(error) && error.code > 0) {
							self.errorCode = parseInt(error.code);
						}
					});

					if (isNaN(self.errorCode)) {
						self.errorCode = 400;
						self.errorMessage = 'Bad request';
					} else {
						switch (self.errorCode) {
							case 401:
								self.errorMessage = 'Need Authorization';
							break;

							case 403:
								self.errorMessage = 'Forbidden';
							break;

							case 404:
								self.errorMessage = 'Not found';
							break;

							case self.errorCode >= 500:
								self.errorMessage = 'Server error';
							break;
						}
					}
					
					return false;
				}

				return (data.items instanceof Array);
			},

			onLoad: function() {},

			onError: function() {
				$(document).trigger('error', [this.errorMessage, this.errorCode]);
			},

			initialize: function(params) {
				if ($.isPlainObject(params)) {
					$.extend(this, params);
				}

				$(this.selectors.button).on('click', function() {
					this.load();
				}.bind(this));
			}
		};
	}
);