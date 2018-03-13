const LIBRARY = {};
LIBRARY.cloudantconfig = {
  account: '2a65f301-9b7d-4107-8edf-50c8e4747c00-bluemix'
};

// authentication cookie check
LIBRARY.isAuth = function(){

}

LIBRARY.getLibrary = function(){
    let xhrArgs = {
      type: 'GET',
      url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/_session`,
      crossDomain: true,
      xhrFields: { withCredentials: true },
      complete: (jqXHR) => {
        if (jqXHR.status === 401){
	  $('#signin').modal('show');
	} else {
	  console.log('getLibrary success');
	}
      }
    };
    
    let auth = $.ajax(xhrArgs);
}

// cloudant sign in (get cookie)
LIBRARY.signin = function(){
    let xhrArgs = {
      type: 'POST',
      url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/_session`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: $("form.form-signin").serialize(),
      success: () => {
        console.log('signin success');
      },
      error: () => {
        console.log('signin error');
	$('#signin').modal('show');
      },
      complete: (jqXHR, statusText) => {
        console.log('signin complete');
      }
    };
    
    let auth = $.ajax(xhrArgs);
}

// cloudant sign out (delete cookie)
LIBRARY.signout = function(){
    let xhrArgs = {
      type: 'DELETE',
      url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/_session`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: () => {
        console.log('signout success');
      },
      error: () => {
        console.log('signout error');
      },
      complete: () => {
        console.log('signout complete');
      }
    };
    
    let auth = $.ajax(xhrArgs);
}

LIBRARY.init = function(){
  LIBRARY.getLibrary();
  $('#signinButton').click(LIBRARY.signin);
  $('#signoutButton').click(LIBRARY.signout);
  console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
