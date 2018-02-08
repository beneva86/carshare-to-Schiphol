// $(document).ready(function() {
//     $('#signup-submit').on('click', function(){
//         let firstname = $("input[name='firstname']").val()
//         let lastname = $("input[name='lastname']").val()
//         let username= $("#input_username").val()
//         let email= $("input[name='email']").val()
//         let phonenumber = $("input[name='phonenumber']").val()
//         let password= $("#inputs[name='password']").val()
//         let password_confirmed= $("input[name='password-confirmed']").val()

//         if (username == '' || email == '' || password == '' || password_confirmed == '') {
//             swal("Oops!", "Please, fill all fields", "error")
//         } 
//         else if (password.length < 8) {
//             $('#password-character').html('<h5 style="color:red"> Password must be at least 8 characters </h5>')
//         }
//         else if (password !== password_confirmed) {
//             $('#email-mark').text('Your email')
//             $('#email-feedback').html('<h5></h5>')
//             $('#password-mark').text('Confirm your password *')
//             $('#password-notmatch').html('<h5 style="color:red"> Passwords do not match </h5>')
//         } 
//         else {
//             $.post('/signup', {username: username, email: email, password: password}, (data) => {
//                 if(data.message_username !== undefined) {
//                     swal("Oops!", data.message_username, "error");
//                 } 
//                 else if (data.message_email !== undefined) {
//                     swal("Oops!", data.message_email, "error");
//                 }   
//                     swal("Hurray", data.message_signup, "success");
//                     $('#username').val('')
//                     $('#email').val('')
//                     $('#password').val('')
//                     $('#password-confirmed').val('')
//                     $('#password-mark').text('Confirm your password')
//                     $('#password-notmatch').html('<h5></h5>')
//                     $('#password-character').html('<h5></h5>')
//         })
//     }
//  })
// })
    
