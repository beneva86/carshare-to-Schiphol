$('#book-btn').click(function(){
	const route = $(this).data('route')
	const requiredseats = $('#title').data('seats')
	
	$.ajax({
		url: '/reservation',
		method: "POST",
		data: {route: route, requiredseats: requiredseats},
		success: function(data){
                window.location = `/confirm?routeId=${route.id}`
            }
        // error: function (XMLHttpRequest, textStatus, errorThrown) {
        //             alert(XMLHttpRequest.status);
        //             alert(XMLHttpRequest.responseText);
        //             alert(errorThrown);
        // }
	})
})
