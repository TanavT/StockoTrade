// Makes an AJAX request to get database data for top 10 profiles
(function ($) {
    const tableBody = $('#leaderboard-body');
    const requestConfig = {
        method: 'GET',
        url: '/leaderboard/json'
    }
    $.ajax(requestConfig).then(function (data) {
        data.forEach(item => {
        const row = $('<tr>');
        row.append( $('<td>').text(item.username) );
        row.append( $('<td>').text(
          item.portfolio_worth.toFixed(2)
        ));
        tableBody.append(row);
      });
    })
})(window.jQuery);
