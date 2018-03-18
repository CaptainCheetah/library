const LIBRARY = {};
LIBRARY.cloudantconfig = {
  account: '2a65f301-9b7d-4107-8edf-50c8e4747c00-bluemix'
};

LIBRARY.getResource = function(params){
	// resource url
	let url = ((params && params.url) ? params.url : false );
	let username = (($('form.form-signin input[name="name"]')) ? $('form.form-signin input[name="name"]').val() : false);
	let password = (($('form.form-signin input[name="password"]')) ? $('form.form-signin input[name="password"]').val() : false);
	let output = false;
	let promise = new Promise((resolve, reject) => {
		if (url) {
			$.ajax({
				type: 'GET',
			  headers: {
			    Authorization: `Basic ${window.btoa(`${username}:${password}`)}`,
			    'Cache-Control': 'no-cache'
			  },
				success: (response) => {
					resolve(response);
				},
				error: (error) => {
					reject(error);
				}
			});
		}
	});

	return promise;
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
  console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
