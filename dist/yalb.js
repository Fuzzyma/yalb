/*! yalb - v0.1.0 - 2015-02-14
* https://github.com/Fuzzyma/yalb
* Copyright (c) 2015 Ulrich-Matthias Schäfer; Licensed MIT */
/* jshint -W083 */
(function(){

    var instance = null;

    var yalb = function(list, options){

        // We create an instance of this plugin
        if(!(this instanceof yalb)){
            // close last instance
            if(instance){ instance.yalb.dispatchEvent(new Event('close')); }
            return new yalb(list, options);
        }else{
            instance = this;
        }

        var settings = {};
        options = options || {};
        
        for(var i in yalb.defaults){
            settings[i] = options[i] || yalb.defaults[i];
        }
        
        var images = [],
            current = settings.current,
            container = document.createElement('div'),
            wrapper = document.createElement('div'),
            createSpan,
            hideLoader,
            hideShowButtons,
            showLoader,
            showError,
            showImg,
            getSrc,
            loadImg,
            changeImg,
            resizeWindow,
            onerror,
            onload,
            prev,
            next,
            show,
            open,
            close;


        // Helper, gives a span with added class and click-event
        createSpan = function(name){
            var span = document.createElement('span');
            span.addEventListener('click', function(){ container.dispatchEvent(new Event(name)); }, false);
            span.className = name;
            return span;
        };

        // hides the loader-icon
        hideLoader = function(){
            container.querySelector('.loader').classList.add('fadeOut');
            container.querySelector('.error').classList.add('fadeOut');
        };

        // hides or shows next and prev-button
        hideShowButtons = function(){
            if(settings.loop && list.length > 1){ return; }

            if(current === list.length - 1){ container.querySelector('.next').classList.add('hide'); }
            else{ container.querySelector('.next').classList.remove('hide'); }

            if(current === 0){ container.querySelector('.prev').classList.add('hide'); }
            else{ container.querySelector('.prev').classList.remove('hide'); }
        };

        // displays the loader-icon
        showLoader = function(){
            container.querySelector('span.loader').classList.remove('fadeOut');
        };

        // shows the error-msg
        showError = function(){

            container.querySelector('img.image').classList.add('fadeOut');
            container.querySelector('span.loader').classList.add('fadeOut');
            container.querySelector('strong.error').classList.remove('fadeOut');

            loadImg([current-1, current+1]);

        };

        // shows the image
        showImg = function(e){
            if(e && e.target !== container && e.propertyName !== 'width'){ return; }
        
            var img = images[current].img;
            img.className = 'image fadeOut';
            
            img.addEventListener('transitionend', function(){
                if(window.getComputedStyle(img).getPropertyValue('opacity') == 0){
                    container.removeChild(img);
                }
            }, false);
            
            container.appendChild(img);
            setTimeout(function(){ img.classList.remove('fadeOut'); }, 0); // Call immediately
            container.dispatchEvent(new CustomEvent('change', {detail:{index:current}}));
            loadImg([current-1, current+1]);
        };

        // returns the src-path of an image
        getSrc = function(obj){

            if(typeof obj === 'string'){ return obj; }

            // check if a data-attribute was specified
            if(obj instanceof Node && settings.src.indexOf('data-') === 0){

                // normalize data string and return the entry of the dataset
                return obj.dataset[
                    settings.src.substr(5).split('-').map(function(el, index){
                        if(!index){ return el; }
                        return el.charAt(0).toUpperCase() + el.slice(1);
                    }).join('')
                ];

            }

            var split = settings.src.split('.');

            // extract path from object in case `src`-path is nested
            for(var i = 0, len = split.length; i < len; ++i){
                obj = obj[split[i]];
            }

            // return path string
            return obj;

        };

        // Loads one or more images
        loadImg = function(arr){

            arr = arr || [current];

            for(var i = arr.length; i--;){

                // When looping is active, make sure we also load images out of range
                if(settings.loop && arr[i] < 0){
                    arr[i] += images.length;
                }

                // check if image is loaded / error / pending or index is out of range
                if(arr[i] >= images.length || arr[i] < 0 || images[arr[i]].loaded || images[arr[i]].pending || images[arr[i]].error){ continue; }

                // start image-loading by setting its path, state is now "pending"
                images[arr[i]].img.src = getSrc(list[arr[i]]);
                images[arr[i]].pending = true;

            }

        };

        // changes the image
        changeImg = function(){

            hideShowButtons();

            if(images[current].loaded){
                // when image is already loaded, start the resizing process
                resizeWindow();
            }else if(images[current].error){
                // if there was an error loading the image, display the error ( no need to resize here )
                showError();
            }else{
                // the image has to be loaded first. Display loader and start loading the Image
                showLoader();
                loadImg();
            }

        };

        // resizes the window to fit the new image
        resizeWindow = function(){
            hideLoader();

            // make sure that new image is not the same as current, fade Out the old Image
            if(container.querySelector('.image') && container.querySelector('.image').src === images[current].img.src){ return; }
            if(container.querySelector('.image')){ container.querySelector('.image').classList.add('fadeOut'); }

            var ratio = images[current].img.naturalWidth / images[current].img.naturalHeight,
                height = images[current].img.naturalHeight,
                width = images[current].img.naturalWidth,
                maxHeight = settings.height || window.innerHeight - 40,
                maxWidth = settings.width || window.innerWidth - 40;

            // scale down image if to big
            if(height > maxHeight){
                height = maxHeight;
                width = ratio * maxHeight;
            }

            if(width > maxWidth){
                width = maxWidth;
                height = maxWidth / ratio;
            }
            
            // when image-dimension didn't change to much ( < 1px) don't animate
            if(Math.abs(parseInt(window.getComputedStyle(container).getPropertyValue('width')) - width) > 1|| 
               Math.abs(parseInt(window.getComputedStyle(container).getPropertyValue('height')) - height) > 1){
                container.style.width = width+'px';
                container.style.height = height+'px';
                container.style.bottom = ((height - window.innerHeight) / 2) + 'px';
                
                // transitionend: showImg();
            }else{
                showImg();
            }

        };

        // returns function which is called when one image could not be loaded
        onerror = function(i){
            return function(){
                images[i].error = true;
                if(i === current){ changeImg(); }
            };
        };

        // returns function which is called when one image is loaded
        onload = function(i){
            return function(){
                images[i].loaded = true;
                // when the just loaded image is the current one we are waiting for: change to it ( we could directly call resizeWindow here)
                if(i === current){ changeImg(); }
            };
        };

        // change to previous image
        prev = function(){
            if(current > 0){
                --current;
                changeImg();
            }else if(settings.loop){
                current = images.length -1;
                changeImg();
            }
        };

        // change to next image
        next = function(){
            if(current < list.length - 1){
                ++current;
                changeImg();
            }else if(settings.loop){
                current = 0;
                changeImg();
            }
        };

        // changes to a specific image
        show = function(e){
            if(e.detail.index !== null){
                current = e.detail.index % images.length;
                changeImg();
            }
        };

        // close yalb
        close = function(){
            wrapper.classList.add('fadeOut');
            // transitionend: removeEventListener for cEvents and wEvents and close
        };

        // open yalb if not already open
        open = function(){
            document.querySelector('body').appendChild(wrapper);
            setTimeout(function(){ wrapper.classList.remove('fadeOut'); }, 0); // immediately
            changeImg();
        };

        var cEvents = {
            prev: prev,
            next: next,
            close: close,
            show: show,
            open: open,
            transitionend: showImg
        };
        
        var wEvents = {
            click: function(e){
                if(e.target === wrapper){ container.dispatchEvent(new Event('close')); }
            },
            transitionend: function(e){
                if(e.target === wrapper && window.getComputedStyle(wrapper).getPropertyValue('opacity') == 0){
                    
                    // Remove all handlers from container
                    for(var i in cEvents){
                        container.removeEventListener(i, cEvents[i], false);
                    }
                
                    // Remove all handlers from wrapper
                    for(var i in wEvents){
                        wrapper.removeEventListener(i, wEvents[i], false);
                    }
                    
                    // Remove wrapper from dom
                    wrapper.parentNode.removeChild(wrapper);
                }
            }
        };
        
        var loader = document.createElement('span'),
            error = document.createElement('strong');
        
        loader.className = 'loader fadeOut';
        error.className = 'error fadeOut';
        
        // add prev/next-links, loader and error-msg
        container.className = settings['class'];
        container.appendChild(createSpan('prev'));
        container.appendChild(createSpan('next'));
        container.appendChild(createSpan('close'));
        container.appendChild(loader);
        container.appendChild(error);

        // wrapper containing yalb
        wrapper.className = settings['class'] + '_wrapper fadeOut';
        wrapper.appendChild(container);

         // Bind events to yalb
        for(var i in cEvents){
            container.addEventListener(i, cEvents[i], false);
        }
        
        // Bind events to wrapper
        for(var i in wEvents){
            wrapper.addEventListener(i, wEvents[i], false);
        }

        this.yalb = container;

        // loop through all images and create an image-object and a state-machine for every one
        for(var i = 0, len = list.length; i < len; ++i){

            images[i] = {
                img: new Image(),
                loaded: false,
                pending: false,
                error: false
            };

            images[i].img.onload = onload(i);
            images[i].img.onerror = onerror(i);

        }

        // Open yalb
        if(settings.open){
            open();
            changeImg();
        }
        
        return yalb;
    };

    yalb.prev = function(){
        if(!instance){ return yalb; }
        instance.yalb.dispatchEvent(new Event('prev'));
        return yalb;
    };

    yalb.next = function(){
        if(!instance){ return yalb; }
        instance.yalb.dispatchEvent(new Event('next'));
        return yalb;
    };

    yalb.close = function(){
        if(!instance){ return yalb; }
        instance.yalb.dispatchEvent(new Event('close'));
        return yalb;
    };

    yalb.show = function(index){
        if(!instance){ return yalb; }
        instance.yalb.dispatchEvent(new CustomEvent('show', {detail:{index:index}}));
        return yalb;
    };

    yalb.open = function(){
        if(!instance){ return yalb; }
        instance.yalb.dispatchEvent(new Event('open'));
        return yalb;
    };

    yalb.get = function(){
        if(!instance){ return yalb; }
        return instance.yalb;
    };

    yalb.defaults = {
        src: 'src',
        current: 0,
        'class': 'yalb',
        loop: true,
        open: true,
        width: 0,
        height: 0
    };

    window.yalb = yalb;

})();