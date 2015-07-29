(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"module-bbop-response-barista.html\">bbop-response-barista</a>","id":"module:bbop-response-barista","children":[{"label":"<a href=\"module-bbop-response-barista-response.html\">response</a>","id":"module:bbop-response-barista~response","children":[]}]}],
        openedIcon: ' &#x21e3;',
        saveState: true,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
