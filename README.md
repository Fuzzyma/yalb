# Yalb (Vanilla)

Yet Another LightBox  
Yalb only uses pure Javascript. All animations are done using css-transition or animation.
If you would like to go with a jQuery-version take a look at [jquery.yalb][jqueryyalb].

[jqueryyalb]: https://github.com/Fuzzyma/jquery.yalb

## Getting Started
Download the [production version][min] or the [development version][max].
Or run 
	
	bower install yalb

[min]: https://raw.githubusercontent.com/Fuzzyma/yalb/master/dist/yalb.min.js
[max]: https://raw.githubusercontent.com/Fuzzyma/yalb/master/dist/yalb.js

Include yalb in your web page:

    <link rel="stylesheet" href="dist/yalb.min.css">
	<script src="dist/yalb.min.js"></script>
	<script>
	jQuery(function($) {
	
	  var images = [
	    'img1.jpg',
	    'img2.jpg',
	    'img3.jpg',
	    'img4.jpg',
	    'img5.jpg'
	  ]
	
	  yalb(images);

      // for other possibilities to call yalb see below

	});
	</script>

## Documentation

### Collections you can pass to Yalb / Examples

- `array` filled with `Strings`

		var images = [
			'img1.jpg',
			'img2.jpg',
			'img3.jpg',
			'img4.jpg',
			'img5.jpg'
		];
		
		yalb(images);

- `NodeList` or `Array` of `Nodes`

		var images = document.getElementsByTagName('img');
        yalb(images);

		// or
		var links = document.getElementsByTagName('a');
		yalb(links, {src: 'href'});

        // or any other node with an attribute containing the path
        // e.g. <span data-image="/path/to/image.jpg"
        yalb(span, {src: 'data-image'});

- `jQuery`-Collection

		var images = $('img');
		yalb(images);

		// or same as above


- selfmade object containing the path

		var images = [
			{
				foo: 'bar'
				path: 'path/to/image.jpg'
			}, 
			{
				// and so on
			}
		];

		yalb(images, {src: 'path'});

		// or even
		var images = [
			{
				path: {
					'to': {
						'image': 'path/to/image.jpg'
					}
				}
			},
			{
				// and so on
			}
		];

		yalb(images, {src: 'path.to.image'});

### Options

The following options can be passed when calling yalb:

- `src` ( `default:'src'` ), Attribute where the path is located.
- `current` ( `default:0` ), The image which is presented when opening yalb
- `class` ( `default:'yalb'` ), The class passed to the html-container of yalb
- `loop` ( `default:true` ), If true, images will be repeated when hitting the first/last image
- `open` ( `default:true` ), If true, yalb opens when called
- `width` ( `default:0` ), max-with of the Yalb-window
- `height` ( `default:0` ), max-height of the Yalb-window

You can change the default values for the whole page by assigning to `yalb.defaults`

    yalb.defaults = {
        src: 'src',
        current: 0,
        'class': 'yalb',
        loop: true,
        open: true,
        width: 0,
        height: 0
    };

### Methods

You can control the behavior of yalb with the following methods

- `yalb.open()` - Opens yalb when still not open
- `yalb.close0()` - Close yalb; same as hitting the close-button
- `yalb.next()` - Next Image; same as hitting the next-button
- `yalb.prev()` - Previous Image; same as hitting the prev-button
- `yalb.show(index)` - Changes to the image on position `index`
- `yalb.get()` - Gets the node of the container on which all events are triggered

### Events

You can listen to the following Events:

- `change` - When the image has changed
- `open` - When open is called (per Method or per yalb-call with `open:true`)
- `close` - When close-button is pressed
- `next` - When next-button is pressed
- `prev` - When prev-button is pressed
- `show` - When show is called
###
    var yalb_instance = yalb.get(); // or yalb_instance = yalb(); or next().next()
    yalb_instance.addEventListener('next', function(){ /* do stuff */ }, false);