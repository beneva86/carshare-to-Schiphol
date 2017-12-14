$(document).ready(function() {
	let input = document.getElementsByClassName('address');
	for (let x = 0; x < input.length; x++) {
        addListener(input[x]);
    }

	function addListener(el) {
	  let autocomplete = new google.maps.places.Autocomplete(el);
  	google.maps.event.addListener(autocomplete,'place_changed',function (){
 //  let place = autocomplete.getPlace();
 //  console.log(place)
  	});
	}

	// prevent users from submitting the form by hitting Enter key
	function stopEnterKey(evt) { 
  		 evt = (evt) ? evt : ((event) ? event : null); 
  		let node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  	if ((evt.keyCode == 13) && (node.type=="text"))  {
  		return false;
  	} 
	} 
	document.onkeypress = stopEnterKey; 
})