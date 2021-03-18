(function() {
  class Menu {
    constructor(element) {
      this.element = element;
      this.offset = 16;
      this.elementId = this.element.getAttribute('id');
      this.trigger = document.querySelectorAll('[aria-controls="' + this.elementId + '"]');
      this.selectedTrigger = false;
      this.menuIsOpen = false;
      this.initMenu();
      this.initMenuEvents();
    }
    initMenu() {
      for (var i = 0; i < this.trigger.length; i++) {
        Util.setAttributes(this.trigger[i], { 'aria-expanded': 'false', 'aria-haspopup': 'true' });
      }
    }
    initMenuEvents() {
      var self = this;
      for (var i = 0; i < this.trigger.length; i++) {
        (function (i) {
          self.trigger[i].addEventListener('click', function (event) {
            event.preventDefault();
            // if the menu had been previously opened by another trigger element -> close it first and reopen in the right position
            if (Util.hasClass(self.element, 'menu--is-visible') && self.selectedTrigger != self.trigger[i]) {
              self.toggleMenu(false, false); // close menu
            }
            // toggle menu
            self.selectedTrigger = self.trigger[i];
            self.toggleMenu(!Util.hasClass(self.element, 'menu--is-visible'), true);
          });
        })(i);
      }
    }
    toggleMenu(bool, moveFocus) {
      // toggle menu visibility
      Util.toggleClass(this.element, 'menu--is-visible', bool);
      this.menuIsOpen = bool;
      if (bool) {
        this.selectedTrigger.setAttribute('aria-expanded', 'true');
        // position the menu element
        this.positionMenu();
        // add class to menu trigger
        Util.addClass(this.selectedTrigger, 'menu-control--active');
      } else if (this.selectedTrigger) {
        this.selectedTrigger.setAttribute('aria-expanded', 'false');
        if (moveFocus)
          Util.moveFocus(this.selectedTrigger);
        // remove class from menu trigger
        Util.removeClass(this.selectedTrigger, 'menu-control--active');
        this.selectedTrigger = false;
      }
    }
    positionMenu(event, direction) {
      var selectedTriggerPosition = this.selectedTrigger.getBoundingClientRect(),
        menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
      // menuOnTop = window.innerHeight < selectedTriggerPosition.bottom + this.element.offsetHeight;
      var left = selectedTriggerPosition.left - this.offset,
        right = (window.innerWidth - selectedTriggerPosition.right - this.offset),
        isRight = (window.innerWidth < selectedTriggerPosition.left + this.element.offsetWidth);

      var horizontal = isRight ? 'right: ' + right + 'px;' : 'left: ' + left + 'px;',
        vertical = menuOnTop
          ? 'bottom: ' + (window.innerHeight - selectedTriggerPosition.top) + 'px;'
          : 'top: ' + selectedTriggerPosition.bottom + 'px;';

      this.element.dataset.position = isRight ? "right" : "left";
      var maxHeight = menuOnTop ? selectedTriggerPosition.top - 20 : window.innerHeight - selectedTriggerPosition.bottom - 20;
      
      this.element.setAttribute('style', horizontal + vertical + 'max-height:' + Math.floor(maxHeight) + 'px;');
    }
    checkMenuFocus() {
      var menuParent = document.activeElement.closest('.js-menu');
      if (!menuParent || !this.element.contains(menuParent))
        this.toggleMenu(false, false);
    }
    checkMenuClick(target) {
      if (!this.element.contains(target) && !target.closest('[aria-controls="' + this.elementId + '"]'))
        this.toggleMenu(false);
    }
  }	








  window.Menu = Menu;

  //initialize the Menu objects
  var menus = document.getElementsByClassName('js-menu');
  if( menus.length > 0 ) {
    var menusArray = [];
    var scrollingContainers = [];
    for( var i = 0; i < menus.length; i++) {
      (function(i){
        menusArray.push(new Menu(menus[i]));
        var scrollableElement = menus[i].getAttribute('data-scrollable-element');
        if(scrollableElement && !scrollingContainers.includes(scrollableElement)) scrollingContainers.push(scrollableElement);
      })(i);
    }

    // listen for key events
    window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) {
        //close menu if focus is outside menu element
        menusArray.forEach(function(element){
          element.checkMenuFocus();
        });
      } else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        // close menu on 'Esc'
        menusArray.forEach(function(element){
          element.toggleMenu(false, false);
        });
      } 
    });
    // close menu when clicking outside it
    window.addEventListener('click', function(event){
      menusArray.forEach(function(element){
        element.checkMenuClick(event.target);
      });
    });
    // on resize -> close all menu elements
    window.addEventListener('resize', function(event){
      menusArray.forEach(function(element){
        element.toggleMenu(false, false);
      });
    });
    // on scroll -> close all menu elements
    window.addEventListener('scroll', function(event){
      menusArray.forEach(function(element){
        if(element.menuIsOpen) element.toggleMenu(false, false);
      });
    });
    // take into account additinal scrollable containers
    for(var j = 0; j < scrollingContainers.length; j++) {
      var scrollingContainer = document.querySelector(scrollingContainers[j]);
      if(scrollingContainer) {
        scrollingContainer.addEventListener('scroll', function(event){
          menusArray.forEach(function(element){
            if(element.menuIsOpen) element.toggleMenu(false, false);
          });
        });
      }
    }
  }
}());