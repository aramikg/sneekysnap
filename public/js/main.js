//main.js
var SNEEKYSNAP = function() {
	scope = this,
	this.init = function() {
		var signupButton = document.querySelector('.js-beta-signup');
		var signupEmail = document.querySelector('.js-beta-email');
		signupButton.onclick = function(e) {
			e.preventDefault();
			if (scope.validateEmail(signupEmail.value)) {
				alert('thanks')
			} else {
				alert('please enter a correct email address')
			}
			
		}
	},
	this.validateEmail = function(email) { 
		console.log('checking email...');
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(re.test(email));
    return re.test(email);
	}	 

}


window.onload = function() {
	var ss = new SNEEKYSNAP();
	ss.init();
}