const LIBRARY = {};
LIBRARY.cloudantconfig = {
  account: '2a65f301-9b7d-4107-8edf-50c8e4747c00-bluemix'
};

LIBRARY.storage = window.localStorage;

LIBRARY.create = function(params){
	let targetDB = ((params && params.target) ? params.target : false );
	let dataObj = ((params && params.data) ? params.data : false );

	let promise = new Promise((resolve, reject) => {
	if (targetDB && dataObj) {
		$.ajax({
		  type: 'POST',
		  url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/${targetDB}`,
		  data: JSON.stringify(dataObj),
		  headers: {
		    "Content-Type": "application/json",
		    Authorization: "Basic " + btoa(`${LIBRARY.storage.getItem("LIBRARY.username")}:${LIBRARY.storage.getItem("LIBRARY.password")}`)
		  },
			success: (response) => {
				resolve(response);
			},
			error: (error) => {
				reject(error);
			}
		});
	} else {
		reject(new Error('Missing parameters'));
	}
	});

	return promise;
}

LIBRARY.delete = function(params){
	// type - book | borrower
}

LIBRARY.update = function(params){
}

LIBRARY.read = function(params){
}

LIBRARY.getFormData = function($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
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

LIBRARY.init = function(){
  $('#credentialsButton').click(function(){
    LIBRARY.saveCredentials();
    $('#credentials').modal('hide');
  });
	
  $('#addBookButton').click(function(){
  	LIBRARY.create({
	  target: 'books',
	  data: LIBRARY.getFormData($('form.form-book'))
	})
	.then(function(){
		$('#book').modal('hide');
		$('form.form-book')[0].reset();
	})
	.catch(function(error){
		console.log(error);
		alert('ERROR');
	});
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
		  {"data":"doc._id"},
		  {"data":"doc.title","title":"Title"},
		  {"data":"doc.author","title":"Author"},
		  {"data":"doc.status", "title":"Status", "defaultContent": "<i class='material-icons text-success'>check_circle</i>"},
		  {"title":"Actions", "render": function(){
		    return 
		      "<button type='button' class='btn btn-sm btn-outline-secondary'><i class='material-icons'>visibility</i></button>" + 
		      "<button type='button' class='btn btn-sm btn-outline-secondary'><i class='material-icons'>edit</i></button>" + 
		      "<button type='button' class='btn btn-sm btn-outline-danger'><i class='material-icons'>delete</i></button>";
		  }},
		]
  });
}
  console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
