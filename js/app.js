//http://megavisor.com/catalog/2206

define(
	'jq', ['jquery'],
	function($) {
		$.holdReady(true);
		return $;
	}
);

require(
	[
		'loader',
		'jq',
		'underscore',
		'text!templates/container.html',
		'text!templates/item.html'
	],
    function(Loader, $, _, ContainerTemplate, ItemTemplate) {

		$.getScript('/js/jquery.flipster.js', function() {
			$.holdReady(false);
		});

		$(document).bind('error', function(e, message, code) {
			message = "Во время работы приложения произошла ошибка:\r\n" + $.trim([code, message].join(' '));
			alert(message);
		});

		$(document).ready(function() {

			var gallery = $(".gallery"),
				tContainer = _.template(ContainerTemplate),
				tItem = _.template(ItemTemplate);

			Loader.initialize({
				onLoad: function() {

					var selected,
						open = function(e) {
							var self = $(this);
							e.preventDefault();

							try {
								new Megavisor.Player.Popup({
									uuid : self.attr('data-id')
								});
							} catch (e ) {
								$(document).trigger('error', [e.message||e.toString()]);
							}
						};

					gallery.empty();
					gallery.append(tContainer());

					gallery.bind('switch', function() {
						if (selected) {
							selected.unbind('click', open);
						}
						selected = $(this).find('.flip-current a:first');
						selected.bind('click', open);
					});

					$.fn.append.apply(gallery.find('ul'), _.map(this.model.items, function(item) {
						return tItem(item);
					}));

					$("#Coverflow").flipster({
						itemContainer: 'ul',
						itemSelector: 'li',
						style:	'coverflow',
						start: 'center',
						enableKeyboard: true,
						enableMousewheel: true,
						enableTouch: true,
						enableNav: false,
						enableNavButtons: false,
						onItemSwitch: function() {
							gallery.trigger('switch');
						}
					});
				}
			});
		});
    }
);