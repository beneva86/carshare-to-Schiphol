$(document).ready(function() {
    $('#signup-submit').click(function(){
        event.preventDefault();

        // Capture form input
        let serializedData = $('#signup').serialize();

        $.ajax({
        type: "POST",
        url : "/signup",
        data: serializedData, 
        success : function(data){
          let error_username = $('#title').data('error_username')
          let error_email = $('#title').data('error_email')     
            console.log(error_username)
            console.log(error_email)
            if (error_username !== undefined) {
            $('#error_username').text(error_username)
            } else if (error_email !== undefined) {
            $('#error_email').text(error_email)
            }
    }  
  })
})
})




