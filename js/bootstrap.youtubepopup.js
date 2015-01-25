/*!
 * Bootstrap YouTube Popup Player Plugin
 * http://lab.abhinayrathore.com/bootstrap-youtube/
 * https://github.com/abhinayrathore/Bootstrap-Youtube-Popup-Player-Plugin
 */
(function ($) {
  var $YouTubeModal = null,
    $YouTubeModalDialog = null,
    $YouTubeModalTitle = null,
    $YouTubeModalBody = null,
    margin = 5;

  //Plugin methods
  var methods = {
    //initialize plugin
    init: function (options) {
      options = $.extend({}, $.fn.YouTubeModal.defaults, options);

      // initialize YouTube Player Modal
      if ($YouTubeModal == null) {
        $YouTubeModal = $('<div class="modal fade ' + options.cssClass + '" id="YouTubeModal" role="dialog" aria-hidden="true">');
        var modalContent = '<div class="modal-dialog" id="YouTubeModalDialog">' +
                              '<div class="modal-content" id="YouTubeModalContent">' +
                                '<div class="modal-header">' +
                                  '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
                                  '<h4 class="modal-title" id="YouTubeModalTitle"></h4>' +
                                '</div>' +
                                '<div class="modal-body" id="YouTubeModalBody" style="padding:0;"></div>' +
                              '</div>' +
                            '</div>';
        $YouTubeModal.html(modalContent).hide().appendTo('body');
        $YouTubeModalDialog = $("#YouTubeModalDialog");
        $YouTubeModalTitle = $("#YouTubeModalTitle");
        $YouTubeModalBody = $("#YouTubeModalBody");
        $YouTubeModal.modal({
          show: false
        }).on('hide.bs.modal', resetModalBody);
      }

      return this.each(function () {
        var obj = $(this);
        var data = obj.data('YouTube');
        if (!data) { //check if event is already assigned
          obj.data('YouTube', {
            target: obj
          });
          $(obj).bind('click.YouTubeModal', function () {
            var youtubeId = options.youtubeId;
            if ($.trim(youtubeId) == '' && obj.is("a")) {
              youtubeId = getYouTubeIdFromUrl(obj.attr("href"));
            }
            if ($.trim(youtubeId) == '' || youtubeId === false) {
              youtubeId = obj.attr(options.idAttribute);
            }
            var videoTitle = $.trim(options.title);
            if (videoTitle == '') {
              if (options.useYouTubeTitle) setYouTubeTitle(youtubeId);
              else videoTitle = obj.attr('title');
            }
            if (videoTitle) {
              setModalTitle(videoTitle);
            }

			// 2015-01-26
			if (isMobile()) {
	            resizeModal(getClientWidth() * (11/12));
			} else {
	            resizeModal(options.width);
		    }

            //Setup YouTube Modal
            var YouTubeURL = getYouTubeUrl(youtubeId, options);
            var YouTubePlayerIframe;
			
			// 2015-01-26
			if (isMobile()) {
	            YouTubePlayerIframe = getYouTubePlayer(YouTubeURL, getClientWidth() * (11/12), getClientWidth()  * (11/12) * (2/3));
			} else {
	            YouTubePlayerIframe = getYouTubePlayer(YouTubeURL, options.width, options.height);
		    }

            setModalBody(YouTubePlayerIframe);
            $YouTubeModal.modal('show');

            return false;
          });
        }
      });
    },
    destroy: function () {
      return this.each(function () {
        $(this).unbind(".YouTubeModal").removeData('YouTube');
      });
    }
  };

  // Whether the browser is for mobile or not
  function isMobile()
  {
     var mobileKeyWords = new Array('iPhone', 'iPod', 'BlackBerry', 'Android', 'Windows CE', 'LG', 'MOT', 'SAMSUNG', 'SonyEricsson');
     for (var word in mobileKeyWords){
         if (navigator.userAgent.match(mobileKeyWords[word]) != null){
             return true;
         }
     }
	 return false;
  }

  // get Client width by Browser kind and version
  function getClientWidth() {
    var ret;
	if (self.innerHeight) {     // IE 외 모든 브라우저
		ret = self.innerWidth;
	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict
		ret = document.documentElement.clientWidth;
	} else if (document.body) {     // IE Browser
		ret = document.body.clientWidth;
	}
	return ret;
  }

  function setModalTitle(title) {
    $YouTubeModalTitle.html($.trim(title));
  }

  function setModalBody(content) {
    $YouTubeModalBody.html(content);
  }

  function resetModalBody() {
    setModalTitle('');
    setModalBody('');
  }

  function resizeModal(w) {
    $YouTubeModalDialog.css({
      width: w + (margin * 2)
    });
  }

  function getYouTubeUrl(youtubeId, options) {
    return ["//www.youtube.com/embed/", youtubeId, "?rel=0&showsearch=0&autohide=", options.autohide,
      "&autoplay=", options.autoplay, "&controls=", options.controls, "&fs=", options.fs, "&loop=", options.loop,
      "&showinfo=", options.showinfo, "&color=", options.color, "&theme=", options.theme, "&wmode=transparent"
    ].join('');
  }

  function getYouTubePlayer(URL, width, height) {
    return ['<iframe title="YouTube video player" width="', width, '" height="', height, '" ',
      'style="margin:0; padding:0; box-sizing:border-box; border:0; -webkit-border-radius:5px; -moz-border-radius:5px; border-radius:5px; margin:', (margin - 1), 'px;" ',
      'src="', URL, '" frameborder="0" allowfullscreen seamless></iframe>'
    ].join('');
  }

  function setYouTubeTitle(youtubeId) {
    var url = ["https://gdata.youtube.com/feeds/api/videos/", youtubeId, "?v=2&alt=json"].join('');
    $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: true,
      success: function (data) {
        setModalTitle(data.entry.title.$t);
      }
    });
  }

  function getYouTubeIdFromUrl(youtubeUrl) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var match = youtubeUrl.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return false;
    }
  }

  $.fn.YouTubeModal = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on Bootstrap.YouTubeModal');
    }
  };

  //default configuration
  $.fn.YouTubeModal.defaults = {
    youtubeId: '',
    title: '',
    useYouTubeTitle: true,
    idAttribute: 'rel',
    cssClass: 'YouTubeModal',
    width: 640,
    height: 480,
    autohide: 2,
    autoplay: 1,
    color: 'red',
    controls: 1,
    fs: 1,
    loop: 0,
    showinfo: 0,
    theme: 'light'
  };
})(jQuery);
