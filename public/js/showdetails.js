$('.details-button').one('click', function(){
	let routeid = $(this).data('routeid')
	let route = $(this).data('route')
	
	// function to calculate the time of the pickuppoints	
	function addMinutesToTime(time, minsAdd) {
		function z(n){ 
			return (n < 10 ? '0' : '') + n
		};
		let bits = time.split(':');
		let mins = bits[0]*60 + +bits[1] + +minsAdd;
		return z(mins%(24*60)/60 | 0) + ':' + z(mins%60);  
		} 
			pickup1_time=addMinutesToTime(route.time,60)
			pickup2_time=addMinutesToTime(route.time,90)
			pickup3_time=addMinutesToTime(route.time,150)
			endpoint_time=addMinutesToTime(route.time,180)

		$(`#${routeid+'pickup1'}`).wrapInner(`<p> ${pickup1_time} </p>`)
		$(`#${routeid+'pickup2'}`).wrapInner(`<p> ${pickup2_time} </p>`)
		$(`#${routeid+'pickup3'}`).wrapInner(`<p> ${pickup3_time} </p>`)
		$(`#${routeid+'endpoint'}`).wrapInner(`<p> ${endpoint_time} </p>`)
})

$('.details-button').click(function(){
	let button = $(this);
	let routeid = button.data('routeid')

	if(button.hasClass('see-details')) {
		button.text('Hide details')
		$(`#${routeid+1}`).removeClass('hidden').addClass('show')
	} else {
		button.text('Details');
		$(`#${routeid+1}`).removeClass('show').addClass('hidden')
	}
	button.toggleClass('see-details');
})

// send post request when user clicks on BOOK btn
$('.book-button').click(function(){
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


