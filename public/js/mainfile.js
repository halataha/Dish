var base_url = window.location.origin;

//social login 
window.fbAsyncInit = function() {
    FB.init({
        appId      : '176152756417987',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.8'
    });
    FB.AppEvents.logPageView();   
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)){
        return;
    }
    js = d.createElement(s); 
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
  
    
function Googlelogin() 
{
     var config = {

         'client_id':'654171435117-dtgfme2hp5t7dvn8re7ssrefhjkso0cb.apps.googleusercontent.com',

         'scope': 'https://www.googleapis.com/auth/plus.login  https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
     };
    gapi.auth.authorize(config, function() {
        // Get_gcontact(gapi.auth.getToken());
        Googleprofile(gapi.auth.getToken());
          
    });
}    

function Googleprofile(token){
    gapi.client.load('plus', 'v1',function() {
        if(token['status']['signed_in'])
        {
            var request = gapi.client.plus.people.get({
                'userId': 'me'
            });
            request.execute(function (response)
                            {
                console.log('Google response');
               
                var email;
                if(response.emails)
                { 
                    for(i = 0; i < response.emails.length; i++)
                    {
                        if(response.emails[i].type == 'account')
                        {
                            email = response.emails[i].value;
                        }
                    }
                } 
                SaveGplus(response,email);
            });
        } 
    });
}

function SaveGplus(e,email){
  
    $('.loading').html('HI,<br>'+e['name']['givenName']+'<br> Email: '+email);  
    var data={
        firstname : e.name.givenName,
        lastname:  e.name.familyName,
        username : e.displayName,
        email : email,
        imageUrl : e.image.url.split("?sz=50")[0]+"?sz="+300,
        id : e.id
    };
    
    $.ajax({
        url:'/registration/googleLogin',
        type:'post',
        data:JSON.stringify(data),
        contentType: 'application/json',
        success:function(res){
            var res = JSON.parse(res);
            if (res == 'error') {
                $('#login_alertMsg').html('<div class="alert alert-danger"><strong> Something went wrong. </strong></div>').show();
                $('#login_alertMsg').delay(4000).fadeOut('slow');
            } else if (res.loginstatus == 'success'){
                
                window.location.href = base_url + '/dishmizer-profile/' + res.user_id;
            }
        }
    });
    
}  
    
function Facebooklogin()
{
    FB.login(function(response) { 
        if (response.status === 'connected') {
            FB.api('/me?fields=id,first_name,last_name,gender,email,name', function(response) {

                if(response.email!="")
                {
                    getfacebook(response); 
                }
                else{
                    alert("Email address not found.") ;
                }
            });
        }
        else {
            console.log('User cancelled login or did not fully authorize.');
        }
    },{scope: 'public_profile,email'});
}

function getfacebook(data)
{ 
    data.picture = 'https://graph.facebook.com/'+data.id+'/picture?type=large'; 
    data.usertype=2;
    $('.social-loading').show(); 
    $.ajax({
        type: 'post',
        url:base_url+'/registration/facebooklogin',
        data: data,
        dataType: 'json',
        success: function(rtdata){  
            $('.social-loading').hide();    
             $('.social-msg').html(rtdata.msg);
            $('.social-msg').show();   
            
            if(rtdata.status==1)
            {
                setTimeout(function(){
                       $('.social-msg').hide();
                       window.location.href = base_url + '/dishmizer-profile/' + rtdata.user_id;
                       },3000);
            }
         else if(rtdata.status==2)
            {
               setTimeout(function(){$('.social-msg').hide();},3000);
            }
            else
            {
                setTimeout(function(){$('.social-msg').hide();},3000);
            }
         }
    });
}
//social login 

var updatePostStats = {

  Like: function(postId) {
    document.querySelector('#likes-count-' + postId).textContent++;
  },
  Unlike: function(postId) {
    document.querySelector('#likes-count-' + postId).textContent--;
  }
};

var toggleButtonText = {
  Like: function(button) {
    button.dataset.postAction = "Unlike";
    $(button).parent().addClass('like');
  },
  Unlike: function(button) {
    button.dataset.postAction = "Like";
    $(button).parent().removeClass('like');

  }
};

var pusher = new Pusher('103150f98012224e3625', {
  cluster: 'ap1'
});
var socketId;

// retrieve the socket ID on successful connection
pusher.connection.bind('connected', function() {
  socketId = pusher.connection.socket_id;
});

var channel = pusher.subscribe('post-events');
channel.bind('postAction', function(data) {
  console.log(data);
  var action = data.action;
  updatePostStats[action](data.postId);
});

var actOnPost = function(event) {
  var postId = event.target.dataset.postId;
  var action = event.target.dataset.postAction;
  var data = {};
  data.user_id = postId;
  data.action = action;
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: '/recipes/like/' + postId,

    success: function(data) {
        console.log('data == ',data);
      if (data == 'session error') {
        window.location.href = base_url + '/login/logout';
      } else {
        toggleButtonText[action](event.target);
      }
    }
  });
};

function leaveReply() {

  if (!$("#commentForm").valid()) {
    return false;
  } else {

    var name = $("#nameCom").val();
    var email = $("#emailCom").val();
    var comment = $("#commentCom").val();
    var recipe_id = $("#rcp_id").val();
    var imageUrl = $("#authrimg").val();
    var data = {};
    data.recipe_id = recipe_id;
    data.imageUrl = imageUrl;
    data.name = name;
    data.email = email;
    data.comment = comment;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/single-recipes/comment/' + data.recipe_id,

      success: function(res) {

        if (res == 'error') {

          $('#alertMsg').html('<div class="alert alert-danger"><strong>Error Occured. Try Again</strong></div>');
          $('#alertMsg').delay(5000).fadeOut('slow');
          window.location.href = base_url + '/single-recipes/' + data.recipe_id;
        } else {

          $('#alertMsg').html('<div class="alert alert-success"><strong>Comment Inserted successfully.</strong></div>');
          $('#alertMsg').delay(5000).fadeOut('slow');
          setTimeout(function() {
            window.location.reload();
          }, 5000);
        }
      }
    });
  }
};


function leaveBlogReply() {

  if (!$("#blogCommentForm").valid()) {
    return false;
  } else {

    var name = $("#blogReply").val();
    var email = $("#blogReplyEmail").val();
    var comment = $("#blogComment").val();
    var blog_id = $("#blg_id").val();
    var imageUrl = $("#authrblogimg").val();
    var data = {};
    data.blog_id = blog_id;
    data.imageUrl = imageUrl;
    data.name = name;
    data.email = email;
    data.comment = comment;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/single-blog/comment/' + data.blog_id,

      success: function(res) {

        if (res == 'error') {

          $('#alertMsg').html('<div class="alert alert-danger"><strong>Error Occured. Try Again</strong></div>');
          $('#alertMsg').delay(5000).fadeOut('slow');
          window.location.href = base_url + '/single-blog/' + data.blog_id;
        } else {

          $('#alertMsg').html('<div class="alert alert-success"><strong>Comment Inserted successfully.</strong></div>');
          $('#alertMsg').delay(5000).fadeOut('slow');
          setTimeout(function() {
            window.location.reload();
          }, 5000);
        }
      }
    });
  }
};

function parentData_save(comment_id, image, content_type_id) {

  if (!$("#newModalForm").valid()) {
    return false;

  } else {
    var nameCommodel = $("#nameCommodel").val();
    var emailCommodel = $("#emailCommodel").val();
    var commentCommodel = $("#commentCommodel").val();
    var data = {};
    data.nameCommodel = nameCommodel;
    data.emailCommodel = emailCommodel;
    data.commentCommodel = commentCommodel;
    data.comment_id = comment_id;
    data.image = image;
    data.content_type_id = content_type_id;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/single-recipes/' + data.comment_id + '/' + data.content_type_id + '/parentCom',

      success: function(res) {

        if (res == 'error') {
          $('#alertMsgmodel').html('<div class="alert alert-danger"><strong>Error Occured. Try Again.</strong></div>');
          $('#alertMsgmodel').delay(5000).fadeOut('slow');
          window.location.href = base_url + '/single-recipes/' + data.content_type_id;
        } else {

          $('#alertMsgmodel').html('<div class="alert alert-success"><strong>Comment Inserted successfully.</strong></div>');
          $("#alertMsgmodel").fadeTo(2000, 500).slideUp(500, function() {
            $("#addMyModal").modal('toggle');
            window.location.reload();
          });
        }
      }
    });
  }
};

function parentBlogData_save(comment_id, image, content_type_id) {

  if (!$("#blog_modal").valid()) {
    return false;

  } else {
    var nameblogCommodel = $("#nameblogCommodel").val();
    var emailblogCommodel = $("#emailblogCommodel").val();
    var commentblogCommodel = $("#commentblogCommodel").val();
    var data = {};
    data.nameblogCommodel = nameblogCommodel;
    data.emailblogCommodel = emailblogCommodel;
    data.commentblogCommodel = commentblogCommodel;
    data.comment_id = comment_id;
    data.image = image;
    data.content_type_id = content_type_id;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/single-blog/' + data.comment_id + '/' + data.content_type_id + '/parentCom',

      success: function(res) {

        if (res == 'error') {
          $('#alertMsgblogmodel').html('<div class="alert alert-danger"><strong>Error Occured. Try Again.</strong></div>');
          $('#alertMsgblogmodel').delay(5000).fadeOut('slow');
          window.location.href = base_url + '/single-blog/' + data.content_type_id;
        } else {

          $('#alertMsgblogmodel').html('<div class="alert alert-success"><strong>Comment Inserted successfully.</strong></div>');
          $("#alertMsgblogmodel").fadeTo(2000, 500).slideUp(500, function() {
            $("#addMyModal").modal('toggle');
            window.location.reload();
          });
        }
      }
    });
  }
};

function parentReply(comment_id, image, recipe_id, name, email) {

  var modal = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button> <h4 class="modal-title">Comment</h4></div><div id="alertMsgmodel"></div><div class="modal-body"><form action="#" role="form" id="newModalForm" method="post"><div class="form-group"><label class="control-label col-md-3" for="name">Name</label><div class="col-md-9"><input type="text" id="nameCommodel" name="nameCommodel" value=' + name + ' class="form-control required" disabled></div></div><div class="form-group"><label class="control-label col-md-3" for="email">Email Address</label><div class="col-md-9"><input type="text" name="emailCommodel" value=' + email + ' class="form-control required" id="emailCommodel" disabled></div></div><div class="form-group"><label class="control-label col-md-3" for="coment">Comment</label><div class="col-md-9"><textarea class="form-control required" name="commentCommodel" rows="10" id="commentCommodel"></textarea></div></div><div class="modal-footer"><input type="button" class="btn btn-success" value="Send Comment" onclick="parentData_save(\'' + comment_id + '\',\'' + image + '\',\'' + recipe_id + '\')" id="btnSaveIt"></div></form></div></div></div>';

  $("#addMyModal").html(modal);
  $("#addMyModal").modal('show');
}


function parentBlogReply(comment_id, image, blog_id, name, email) {

  var modal = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button> <h4 class="modal-title">Comment</h4></div><div id="alertMsgblogmodel"></div><div class="modal-body"><form action="#" role="form" id="blog_modal" method="post"><div class="form-group"><label class="control-label col-md-3" for="name">Name</label><div class="col-md-9"><input type="text" id="nameblogCommodel" name="nameblogCommodel" value=' + name + ' class="form-control required" disabled></div></div><div class="form-group"><label class="control-label col-md-3" for="email">Email Address</label><div class="col-md-9"><input type="text" name="emailblogCommodel" value=' + email + ' class="form-control required" id="emailblogCommodel" disabled></div></div><div class="form-group"><label class="control-label col-md-3" for="coment">Comment</label><div class="col-md-9"><textarea class="form-control required" name="commentblogCommodel" rows="10" id="commentblogCommodel"></textarea></div></div><div class="modal-footer"><input type="button" class="btn btn-success" value="Send Comment" onclick="parentBlogData_save(\'' + comment_id + '\',\'' + image + '\',\'' + blog_id + '\')" id="btnSaveIt"></div></form></div></div></div>';

  $("#addMyBlogModal").html(modal);
  $("#addMyBlogModal").modal('show');
}

function loginUser() {
  if (!$("#loginForm").valid()) {
    return false;
  } else {
      $('#login_refresh').show();

    var username = $("#username1").val().trim();
    var password = $("#password1").val().trim();
    var remember_me = $('#remember_me').is(":checked")
    var data = {};
    data.username = username;
    data.password = password;
    data.remember_me = remember_me;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/login',

      success: function(res) {
          $('#login_refresh').hide();
        var res = JSON.parse(res);
        if (res.loginstatus == 'error') {
          $('#login_alertMsg').html('<div class="alert alert-danger"><strong>' + res.msg + '</strong></div>').show();
          $('#login_alertMsg').delay(4000).fadeOut('slow');
        } else if (res.loginstatus == 'success') {
          window.location.href = base_url + '/dishmizer-profile/' + res.user_id;
            
//          window.location.href = history.back();
        }
      }
    });
  }
}

function resendVerification() {

  var modal = '<div class="modal-dialog"><div class="modal-content"><!--ModalHeader--><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="myModalLabel">Email Verification</h4></div><div class="modal-body"><div id="emailvar_alert"></div><form action="#" role="form" id="emailV" method="post" onclick="resend_Link();return event.keyCode != 13;"><div class="form-group"><label for="emailvar">Email address</label><input type="email" id="emailvar" name="emailvar" class="form-control required"></div></form></div><div class="modal-footer"><input type="button" class="btn btn-success" value="Submit" onclick="resend_Link()" id="btnSave"><button type="button" class="btn btn-default" id="btnCloseIt" data-dismiss="modal">Close</button><i id="refresh" class="fa fa-refresh fa-2 fa-spin" aria-hidden="true" style="font-size:20px;display:none"></i></div></div></div>';

  $("#my-modal").html(modal);
  $("#my-modal").modal('show');

}

function resend_Link() {
    
  if (!$("#emailV").valid()) {
    return false;
  } else {
      $('#refresh').show();
    var email = $('#emailvar').val();
    var data = {};
    data.email = email;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/login/resendLink',

      success: function(res) {
          $('#refresh').hide();
          $('#emailvar_alert').html('<div class="alert alert-danger"><strong>' + res + '</strong></div>');

          $("#emailvar_alert").fadeTo(2000, 500).slideUp(500, function() {
          $("#emailVerify").modal('toggle');
//          window.location.href = base_url + '/login';
        });
      }
    });
  }
}

function pass_forgot() {

  var modal = '<div class="modal-dialog"><div class="modal-content"><!--ModalHeader--><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title" id="myModalLabel">Forgot Password</h4></div><div class="modal-body"><div id="fPassword_alert"></div><form role="form" id="passF" onkeypress="change_password();return event.keyCode != 13;"><div class="form-group col-sm-12"><label for="forgotpass">Email address</label><input type="email" id="forPass" name="forPass" class="form-control required"></div><div class="col-sm-12"><input type="button" class="btn btn-success" value="Submit" onclick="change_password()" id="btnSave"><i id="refresh" class="fa fa-refresh fa-2 fa-spin" aria-hidden="true" style="font-size:20px;display:none"></i></div></form><div class="clearfix"></div></div>';
  $("#my-modal").html(modal);
  $("#my-modal").modal('show');
}

function change_password() {
    
  if (!$("#passF").valid()) {
    return false;
  } else {
      $('#refresh').show();
    var email = $('#forPass').val();
    var data = {};
    data.email = email;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/login/changePassword',

      success: function(res) {
       var res = JSON.parse(res);
          $('#refresh').hide();
          $('#fPassword_alert').html('<div class="alert alert-'+res.status+'"><strong>' + res.msg + '</strong></div>');
          $("#fPassword_alert").fadeTo(3000, 500).slideUp(500, function() {
            $("#my-modal").modal('toggle');
        });
      }
    });
  }
}

function Email_contact() {
  
  if(!$('#contactEmail').valid())
  {
    return false
  } else {
    $('#refresh').show();
    var nameEmailer = $('#nameEmailer').val();
    var emailEmailer = $('#emailEmailer').val();
    var subject = $('#subject').val();
    var message = $('#message').val();
    var data = {};
    data.nameEmailer = nameEmailer;
    data.emailEmailer = emailEmailer;
    data.subject = subject;
    data.message = message;

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: base_url + '/contact-us/contactEmail',

      success: function(res) {
        var res = JSON.parse(res);
        $('#refresh').hide();
        $('#EmailalertMsg').html('<div class="alert alert-'+res.status+'"><strong>'+res.msg+'</strong></div>');
      
        $('#EmailalertMsg').delay(5000).fadeOut('slow');
        setTimeout(function() {
          window.location.reload();
        }, 4000);
      }
    });
  }
}









