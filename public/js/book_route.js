// send post request when user clicks on BOOK btn
$('#book_btn').click(function(){
	let route = $(this).data('route')
	let requiredseats = $('#title').data('seats')
	let pickuppoints = $('#title').data('pickuppoints')

	$.ajax({
		url: '/reservation',
		method: "POST",
		data: {route: route, requiredseats: requiredseats, pickuppoints: pickuppoints},
		success: function(data){
                window.location = `/confirm/${route.id}`
            },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert(XMLHttpRequest.status);
                    alert(XMLHttpRequest.responseText);
                    alert(errorThrown);
        }
	})
})