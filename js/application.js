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
      url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/books`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      complete: (jqXHR) => {
        console.log('complete');
	consle.log(jqXHR);
      }
    };
    
    let auth = $.ajax(xhrArgs);
}

// cloudant sign in (get cookie)
LIBRARY.signin = function(u,p){
  let username = ((u && typeof u === 'string') ? u : false);
  let password = ((p && typeof p === 'string') ? p : false);

  if (username && password) {
    let xhrArgs = {
      type: 'POST',
      url: `https://${LIBRARY.cloudantconfig.account}.cloudant.com/_session`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        name: username,
        password: password
      },
      success: () => {
        console.log('success');
      },
      error: () => {
        console.log('error');
      },
      complete: () => {
        console.log('complete');
      }
    };
    
    let auth = $.ajax(xhrArgs);
  } else {
   console.log('Credentials not provided'); 
  }
}

// cloudant sign out (delete cookie)
LIBRARY.signout = function(){

}

LIBRARY.init = function(){
  console.log('getLibrary');
  LIBRARY.getLibrary();
	console.log('Classroom library loaded');
}

$(document).ready(() => {
  LIBRARY.init();
});
