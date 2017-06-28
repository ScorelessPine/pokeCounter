var phonecatApp = angular.module('pokeCounter', ['ngRoute']);
var fb = new Firebase("https://poke-shinycounter.firebaseio.com");
//(65535/8200-chain*200)/65536
//(14747 - 40*chain)/2621440*(41-chain);
//COUNTER OBJECT
/*
	{
		id : int,
		pokemon : string,
		numero : int,
		quantity : int,
		version : DPP || X/Y || ORSA,
		method : Egg || Radar || Reset,
		charm : bool,
		masuda : bool,
		chainOdd : 0
	}
*/
var chrono = {
	min : 0,
	sec : 0,
	mill : 0,
	startTime : 0,
	time : 0,
	timeout : '',
	isRun : false,
	isPause : false,
	diff : 0,
	start : function(){
		if(this.isRun){
			this.isRun = false;
			this.isPause = true;
			clearTimeout(this.timeout);
		}else{
			this.isRun = true;
			this.startTime = new Date();
			this.run();
		}
	},
	run : function(){
		if(!this.isPause){
			var end = new Date();
			this.diff = end - this.startTime;
			this.diff = new Date(this.diff);
		}else{
			this.startTime = new Date() - this.diff;
			this.startTime = new Date(this.startTime);
			this.isPause = false;
		}

		var msec = (this.diff.getMilliseconds() < 100) ? '0'+this.diff.getMilliseconds() : this.diff.getMilliseconds();
		var sec = (this.diff.getSeconds() < 10) ? '0'+this.diff.getSeconds() : this.diff.getSeconds();
		var min = (this.diff.getMinutes() < 10) ? '0'+this.diff.getMinutes() : this.diff.getMinutes();

		$("#chronoStart").html("Stop");
		$("#displayChrono span#min").html(min);
		$("#displayChrono span#sec").html(sec);
		$("#displayChrono span#msec").html(msec);

		this.timeout = setTimeout("chrono.run()", 10);
	},
	reset : function(){
		this.startTime = new Date();
		$("#displayChrono span#min").html('00');
		$("#displayChrono span#sec").html('00');
		$("#displayChrono span#msec").html('000');
		if(this.isPause){
			this.isRun = false;
			this.isPause = false;
		}
	}
};

//jQuery
$(document).ready(function(){
	$('#chronoStart').click(function(e){
		chrono.start();
	});

	$('#chronoReset').click(function(e){
		chrono.reset();
	});

	$('body').on('click', 'div.counter', function(e){
		if( $(e.target).hasClass('counter') ){
			angular.element( $('body')).scope().setSelected( $(e.target) );
		}else if( $(e.target).parents("div.counter") ){
			angular.element( $('body')).scope().setSelected( $(e.target).parents("div.counter") );
		}
	});

	$('body').on('focusout', '[contenteditable]', function(e){
		var value = parseInt( $(e.target).html() );
		angular.element($('body')).scope().saveData(value, $(e.target).attr('id'));
	});	

	$('#js-notes').on('click', function(e){
		$('#overlay').show();
		return false;
	});

	$('#overlay').on('click', function(e){
		$('#overlay').hide();
	}).children().click(function(e){
		return false;
	});

	$('#open').on('click', function(e){
		console.log(parseInt( $('#wrapper').css("left")));
		if( parseInt( $('#wrapper').css("left")) < 0 )
			$('#wrapper').css({left: 0});
		else
			$('#wrapper').css({left: -300});
	});
});

//Angular
phonecatApp.config(function($routeProvider){
	$routeProvider.
		when('/', {
			templateUrl : 'partials/signup.html',
			controller : 'SignupController'
		})
		.when('/counter', {
			templateUrl : 'partials/counter.html',
			controller : 'todoCtrl'
		});
})
.controller('todoCtrl', function ($scope) {
	$scope.pokemons = Pokemon;
	$scope.counters = [];
	$scope.chainCount = 0;
	$scope.creatorMode = "counter";
	$scope.chrono = {
		min : 0,
		sec : 0,
		msec : 0
	};
	$scope.counterSelected;
	$scope.collection = [];

	$scope.addToCollec = function(counterId){
		var add = true;
		for(elt in $scope.collection){
			if($scope.collection[elt].id == counterId){
				add = false;
			}
		}

		for(pkmn in this.counters){
			if(this.counters[pkmn].id == counterId && add){
				$scope.collection.push(this.counters[pkmn]);
			}
		}
		localStorage.setItem('pokeCounterCollec', angular.toJson($scope.collection) );
		$scope.erase(counterId);
	};

	$scope.onkeyUp = function(event){
		if( event.keyCode == 90 && $scope.collection[1]){
			$scope.inc(1, $scope.collection[1].id);
		}
	};
	
	$scope.onkeyUp = function(event){
		if( event.keyCode == 88 && $scope.collection[2]){
			$scope.inc(1, $scope.collection[2].id);
		}
	};
	
	$scope.onkeyUp = function(event){
		if( event.keyCode == 67 && $scope.collection[3]){
			$scope.inc(1, $scope.collection[3].id);
		}
	};
	$scope.onkeyUp = function(event){
		if( event.keyCode == 86 && $scope.collection[4]){
			$scope.inc(1, $scope.collection[4].id);
		}
	};
	

	$scope.setSelected = function(jObject){
		$('div.counter').removeClass('selected');
		jObject.addClass('selected');
		$scope.counterSelected = parseInt(jObject.attr('id'));
	};

	$scope.startTimer = function(){
		chrono.start();
	};

	$scope.resetTimer = function(){
		chrono.reset();
	};

	$scope.swapMode = function(){
		if($scope.creatorMode == "chrono"){
			$scope.creatorMode = "counter";
		}else if($scope.creatorMode == "counter"){
			$scope.creatorMode = "chrono";
		}
	};

	$scope.chronoValue = function(min, sec, msec){
		$scope.chrono = { min : min, sec : sec, msec : msec};
		$scope.chrono.msec = msec;
	};

	$scope.inc = function(value, id){
		for(pkmn in this.counters){
			if(this.counters[pkmn].id == id){
				this.counters[pkmn].quantity += value;

				if(this.counters[pkmn].quantity <= 0)
					this.counters[pkmn].quantity = 0;
			}
		}

		localStorage.setItem('pokeCounter', angular.toJson($scope.counters) );
	};

	$scope.createCounter = function(){
		var id = parseInt($("#cnt-pkmn").val());
		var zeros = 3 - id.toString().length;
		var numero = '';
		numero += id;

		var newCounter = {
			id : Math.random() * 9999999 | 0,
			pokemon : $scope.pokemons[id-1].name,
			numero : numero,
			quantity : 0,
			version : '',
			method : '',
			charm : false,
			masuda : false,
			chain : 0,
			odd : 4096,
			chainOdd : 0,
			gotIt : "false"
		};

		newCounter.version = $("form[name='versionForm'] input[type='radio']:checked").val();
		newCounter.method = $("form[name='methodForm'] input[type='radio']:checked").val();
		if( !newCounter.method ){
			alert('Please pick a method');
			return false;
		}

		if( !newCounter.version ){
			alert('Please pick a version');
			return false;
		}

		if( newCounter.version == "dpp")
			newCounter.odd = newCounter.odd * 2;

		$("form[name='eggForm'] input[type='checkbox']:checked").each(function(elt){
			if( $(this).val() == 'charm' ){
				newCounter.charm = true;
				newCounter.odd = newCounter.odd / 3;
			}

			if( $(this).val() == 'masuda' ){
				newCounter.masuda = true;
				if( newCounter.method == "egg" )
					newCounter.odd = newCounter.odd / 6;
			}

			newCounter.odd = newCounter.odd | 0;
		});

		$scope.counters.push(newCounter);
		localStorage.setItem('pokeCounter', angular.toJson($scope.counters) );
	};

	$scope.init = function(){
		$scope.counters = angular.fromJson( localStorage.getItem('pokeCounter') );
		$scope.collection = angular.fromJson( localStorage.getItem('pokeCounterCollec') );

		if(!$scope.counters)
			$scope.counters = [];

		if(!$scope.collection)
			$scope.collection = [];
	};

	$scope.saveData = function(value, id){
		for(pkmn in this.counters){
			if(this.counters[pkmn].id == id){
				this.counters[pkmn].quantity = value;
				break;
			}
		}
		localStorage.setItem('pokeCounter', angular.toJson($scope.counters) );
	};

	$scope.erase = function(id){
		for(pkmn in this.counters){
			if(this.counters[pkmn].id == id){
				this.counters.splice(pkmn, 1);
				break;
			}
		}
		localStorage.setItem('pokeCounter', angular.toJson($scope.counters) );
	};

	$scope.incChain = function(value, id){
		for(pkmn in this.counters){
			if(this.counters[pkmn].id == id){
				var count = this.counters[pkmn];
				if( count.chain + value < 0 ){
					count.chain = 0;
					return;
				}

				count.chain += value;
				$('label#l'+id).html( count.chain );
				var odd = $scope.getOdds(count.chain);
				if( count.version == "dpp")
					odd /= 2;

				$('label#o'+id).html( odd + "%" );
				$scope.inc(value, id);

				count.chainOdd = odd;
				localStorage.setItem('pokeCounter', angular.toJson($scope.counters) );
			}
		}
	};

	$scope.getOdds = function(value){
		var chain = value > 40 ? 40: value;
		var res = (14747 - 40*chain)/ (2621440*(41-chain))*100;
		return res.toFixed(3);	 
	}

	$scope.resetChain = function(id){
		$scope.chainCount = 0;
		$('label#l'+id).html( $scope.chainCount );
		$('label#o'+id).html( "0%" );
	}

	$scope.clearStorage = function(){
		confirm("Are you sure you are ready ?\nYou can't comeback after this.\nAre you values correctly stored ?");
		localStorage.setItem('pokeCounter', {});
		window.location.reload();
	}
})
.controller('FormController', function ($scope) {
    $scope.pw1 = '';
   	$scope.data = {
   		email : '',
   		pw1 : '',
   		pw2 : ''
   	};

    $scope.submit = function(){
    	console.log($scope.data);
    	ref.createUser({
    		email : $scope.data.email,
    		password : $scope.data.pw2
    	}, function(error, userData){
    		if(error){
    			console.log("Error creating user : "+error);
    		} else {
    			console.log("Succesfully created user account with uid :" + userData.uid);
    		}
    	});
    };
})
.controller('SignupController', function($scope){
	$scope.message = "SIGNUP NOW";
})
.directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);
