define(['jquery'], function($) {
    var Paginator = {};

    Paginator.setPage = function(paginated, newPage) {
        var pages = $('.page', paginated);

        pages.hide();
        pages.filter('[data-page="' + newPage + '"]').show();
        paginated.data('page', newPage);
    }

    $(function() {
        $('body').on('click', '.page-change', function(e) {
            e.preventDefault();

            var paginated = $(this).closest('.paginated');
            var newPage = $(this).data('page');
            
            Paginator.setPage(paginated, newPage);
        });
    });

    return Paginator;
});