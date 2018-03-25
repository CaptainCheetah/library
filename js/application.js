const LIBRARY = {};
LIBRARY.cloudantconfig = {
  account: '2a65f301-9b7d-4107-8edf-50c8e4747c00-bluemix'
};

LIBRARY.qrOpts = {
  render: 'image',
  crisp: true,
  minVersion: 5,
  ecLevel: 'H',
  size: 200,
  ratio: null,
  fill: '#000',
  back: '#fff',
  // text: '${CONTENT}',
  rounded: 3,
  quiet: 1,
  mode: 'label',
  mSize: 9,
  mPosX: 50,
  mPosY: 98,
  label: 'BARTEL LIBRARY', // label
  fontname: 'sans-serif',
  fontcolor: '#000',
  image: null
};

LIBRARY.storage = window.localStorage;

LIBRARY.create = function(params){
	let targetDB = ((params && params.target) ? params.target : false );
	let dataObj = ((params && params.data) ? params.data : false );

	let promise = new Promise((resolve, reject) => {
	if (targetDB && dataObj) {
		// check for duplicate
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

LIBRARY.delete = function(obj){
	let targetdb = ((obj && obj.dataset && obj.dataset.targetdb) ? obj.dataset.targetdb : false );
	let docid = ((obj && obj.dataset && obj.dataset.docid) ? obj.dataset.docid : false );
	let docrev = ((obj && obj.dataset && obj.dataset.docrev) ? obj.dataset.docrev : false );

	let promise = new Promise((resolve, reject) => {
		if (targetdb && docid && docrev) {
			$.ajax({
			  type: 'DELETE',
			  url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/${targetdb}/${docid}?rev=${docrev}`,
			  headers: {
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

	promise.then(function(){
         $('#books').DataTable().ajax.reload();
	})
	.catch(function(error){
		console.log(error);
		alert('ERROR');
	});;
}

LIBRARY.update = function(params){
}

LIBRARY.view = function(obj){
	let docid = ((obj && obj.dataset && obj.dataset.docid) ? obj.dataset.docid : false );
	if (docid) {
	 LIBRARY.qrOpts.text = docid;
	 let el = kjua(LIBRARY.qrOpts);
	 $('#viewDetails').empty().append(el);
	 $('#view').modal('show');
	}
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
		$('#books').DataTable().ajax.reload();
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
            "serverSide": false,
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
        // console.log(d);
      },
      "beforeSend": function (xhr) {
        xhr.setRequestHeader ("Authorization", "Basic " + btoa(`${LIBRARY.storage.getItem("LIBRARY.username")}:${LIBRARY.storage.getItem("LIBRARY.password")}`));
      },
       "dataFilter": function(data) {
        // console.log(data);
        var data = JSON.parse(data);
        data['recordsTotal']= data["total_rows"];
        data['recordsFiltered']= data["total_rows"];
        return JSON.stringify(data);
      }
    },

		"columns":[
		  {"data":"doc.title","title":"Title"},
		  {"data":"doc.author","title":"Author"},
		  {"data":"doc._id","title":"Actions", "render": function(data, type, row, meta){
		      // "<button type='button' class='btn btn-sm btn-outline-secondary'><i class='material-icons'>edit</i></button>" + 
		      return "<button type='button' class='btn btn-sm btn-outline-secondary' onclick='LIBRARY.view(this)' data-docid='" + data + "'><i class='material-icons'>visibility</i></button>" +
			     "<button type='button' class='btn btn-sm btn-outline-danger' onclick='LIBRARY.delete(this)' data-docid='" + data + "' data-docrev='" + row.doc._rev + "' data-targetdb='books'><i class='material-icons'>delete</i></button>";
		  }},
		]
  });
}
  console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
