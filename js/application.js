const LIBRARY = {};
LIBRARY.cloudantconfig = {
  account: '2a65f301-9b7d-4107-8edf-50c8e4747c00-bluemix'
};

LIBRARY.storage = window.localStorage;

LIBRARY.create = function(params){
	// type - book | borrower
}

LIBRARY.delete = function(params){
	// type - book | borrower
}

LIBRARY.getResource = function(params){
	// resource url
	let resource = ((params && params.url) ? params.url : false );
	let username = (($('form.form-signin input[name="name"]')) ? $('form.form-signin input[name="name"]').val() : false);
	let password = (($('form.form-signin input[name="password"]')) ? $('form.form-signin input[name="password"]').val() : false);
	let output = false;
	
	console.log('LIBRARY.getResource');
	console.log(username);
	console.log(password);
	console.log(`${username}:${password}`);
	console.log(`Basic ${window.btoa(`${username}:${password}`)}`);
	
	let promise = new Promise((resolve, reject) => {
		if (resource) {
			$.ajax({
			  type: 'GET',
			  url: resource,
			  headers: {
			    Authorization: `Basic ${window.btoa(`${username}:${password}`)}`
			  },
				success: (response) => {
					resolve(response);
				},
				error: (error) => {
					reject(error);
				}
			});
		} else {
			reject(new Error('No URL provided'));
		}
	});

	return promise;
}

LIBRARY.saveCredentials = function(){
  $.each($("form.form-credentials").serializeArray(), function(idx, cred){
    LIBRARY.storage.setItem(Object.keys(cred)[0], cred[Object.keys(cred)[0]]);
  });
}

LIBRARY.deleteCredentials = function(){
  console.log('Delete credentials from localStorage');
}

LIBRARY.getCredentials = function(){
  console.log('Get credentials from localStorage');
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

LIBRARY.init = function(){
  $('#credentialsButton').click(function(){
    LIBRARY.saveCredentials();
    $('#credentials').modal('hide');
  });
  LIBRARY.getCredentials();
  console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
