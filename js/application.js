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

LIBRARY.update = function(params){
}

LIBRARY.read = function(params){
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
    LIBRARY.storage.setItem(`LIBRARY.${cred.name}`, cred.value);
  });
}

LIBRARY.deleteCredentials = function(){
  console.log('Delete credentials from localStorage');
}

LIBRARY.getCredentials = function(){
  console.log('Get credentials from localStorage');
  if (LIBRARY.storage.getItem("LIBRARY.username") && LIBRARY.storage.getItem("LIBRARY.password")){
    $("form.form-credentials input[name='username']").val(LIBRARY.storage.getItem("LIBRARY.username"));
    $("form.form-credentials input[name='password']").val(LIBRARY.storage.getItem("LIBRARY.password"));
    return true;
  }
	
  $('#credentials').modal('show');
  return false;
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
if (LIBRARY.getCredentials()){
  $('#books').DataTable( {
	  
            "bSort" : false,  //sorting disabled
            "searching": false,
            "processing": true,
            "serverSide": true,
	  "lengthChange": false,
    "ajax": {
      "url": `https://${LIBRARY.cloudantconfig.account}.cloudant.com/books/_all_docs?include_docs=true`,
      "dataSrc": "rows",
      "data": function ( d ) {
        d.limit = d.length;
        d.skip =d.start;
        if(d.search && d.search["value"] && d.search["value"] != "" ){
          d.key='"'+d.search["value"]+'"';     
          delete d.search["value"];
          delete d.search["regex"];          
        }
        console.log(d);
      },
      "beforeSend": function (xhr) {
        xhr.setRequestHeader ("Authorization", "Basic " + btoa(`${LIBRARY.storage.getItem("LIBRARY.username")}:${LIBRARY.storage.getItem("LIBRARY.password")}`));
      },
       "dataFilter": function(data) {
        console.log(data);
        var data = JSON.parse(data);
        data['recordsTotal']= data["total_rows"];
        data['recordsFiltered']= data["total_rows"];
        return JSON.stringify(data);
      }
    },
		"columns":[
		  // {"data":"doc._id"},
		  {"data":"doc.title","title":"Title"},
		  {"data":"doc.author","title":"Author"},
		]
  });
}
  console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
