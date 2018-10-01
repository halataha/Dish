// JavaScript Document
/*
 function dispatch
 params
 fn = function name
 args = array of function parameter    --------------------------------------------------------------------------------------------------------------------
 Dispatch detect function and assing parameter to function if applicable
 */
 

function dispatch(fn, args) {
    fn = (typeof fn == "function") ? fn : window[fn];  // Allow fn to be a function object or the name of a global function
    return fn.apply(this, args || []);  // args is optional, use an empty array by default
}

/*
 function getContent
 params
 data  = contains entire data .
 url   = url in which data has to be send
 container = container id in which data has to te append
 --------------------------------------------------------------------------------------------------------------------
 here we are sending data to show selected data when go into form 2.
 */
function getContent(url, data, container) {
    $.ajax({
        url: url,
        data: data,
        type: 'POST',
        success: function(data) {
            $('#' + container).html(data);
        }
    });
}

/*
 function setForm
 Params
 id = id of form    
 --------------------------------------------------------------------------------------------------
 This function apply jquery validation on submit of the page and do ajax submit of the page.
 this function accept json out in result do perfom next steps according to parameters check detail with showResponse function
 
 */
 var formId='';
function setForm(id) {

    var v = jQuery("#" + id).validate({
							 
        errorLabelContainer: $("#" + id + "_Errmsg"),
        submitHandler: function(form) {	
        jQuery('#'+id+' #loading1').show();
        
            jQuery(form).ajaxSubmit({					
                beforeSubmit: showRequest,
                success: showResponse
            });
        }
    });
    jQuery("#reset").click(function() {
        v.resetForm();
    });
}

function showResponse(responseText, statusText, xhr, $form) {

    
	if(typeof(responseText)!='object'){
		jobj =  jQuery.parseJSON(responseText)
	}else{
		jobj = responseText;
	}
   formId = $form.attr('id');
   showMessage();

}
/*
 function showMessage
 show success and error message on response of ajax form submit.
 jobj.type = type of message success/error (sucMsg/errorMsg)
 jobj.msg = success/error message
 jobj.redirect = 0: for hold on pop , 1: close pop up , url: to redirect page
 */

function showMessage() {
  
	jQuery('#'+formId+' #loading1').hide();
	$('#'+formId+' :submit').prop("disabled", false);
	
    if (jobj.re_fun != '') {
        if (jobj.arg != '') {
            dispatch(jobj.re_fun, eval(jobj.arg));
        }
        else {
            dispatch(jobj.re_fun);
        }
    }
	var newclass;
	if(jobj.class=='errMsg')
	{
		newclass = 'alert alert-danger';
	}
	else
	{
		newclass = 'alert alert-success';
      
	}

	$('#'+formId+' #msg').html('<div class="' + newclass + '" align="center">' + jobj.msg + '</div>').show();
    if (jobj.redirect !='') {
        $('#'+formId+' #msg').delay(5000).fadeOut(450,redirect);
        
    }else{
		 $('#'+formId+' #msg').delay(5000).fadeOut(450);
	}
   
}
function redirect() {

   $(location).attr('href', jobj.redirect);
   // $('#'+formId).clearForm();
}
function showRequest(arr, $form, options)
{
   formId = $form.attr('id');
   console.log('in request',formId,$('#'+formId+' :submit'));
   $('#'+formId+' :submit').prop("disabled", true);
}
