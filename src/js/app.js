App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("GioconePortone.json", function(giocone) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.GioconePortone = TruffleContract(giocone);
      // Connect provider to interact with contract
      App.contracts.GioconePortone.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  render: function() {
    var gioconeInstance;
    var loader = $("#loader");
    var content = $("#content");
  
    loader.show();
    content.hide();
  
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
  
    // Load contract data
    App.contracts.GioconePortone.deployed().then(function(instance) {
      gioconeInstance = instance;
     
     

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  play: function() {
    var gioconeInstance;
    var loader = $("#loader");
    var content = $("#content");

    var doorset = $('#doorset').val();
    var door = $('#door').val();

    App.contracts.GioconePortone.deployed().then(function(instance) {
      gioconeInstance = instance;

      var ammount = 0.001;
      var etherAmount = web3.toBigNumber(ammount);
      var weiValue = web3.toWei(etherAmount,'ether');
      console.log("set: " + doorset);
      console.log("door: " + door);
      return gioconeInstance.play(doorset, door, { from: App.account, value: weiValue });
    }).then(function(result) {

      console.log(result);

      $('#confirmModal').modal('hide');

      $('#portoni').html('');
      $("#btnInitPlay").show();

      // Wait for votes to update
      //$("#content").hide();
      //$("#loader").show();
    }).catch(function(err) {
      console.error(err);

      $("#message").html(err.message);
      $("#message").addClass("alert-danger");
      $("#message").show();

      $('#confirmModal').modal('hide');

      $('#portoni').html('');
      $("#btnInitPlay").show();

    });
  },

  initPlay: function() {
    var gioconeInstance;
    var loader = $("#loader");
    var content = $("#content");

    $("#message").removeClass("alert-danger");
    $("#message").removeClass("alert-success");
    $("#message").removeClass("alert-warning");
    $("#message").hide();

      loader.show();
      content.hide();
      // Load contract data
      App.contracts.GioconePortone.deployed().then(function(instance) {
        gioconeInstance = instance;
        return gioconeInstance.getPlay();
      }).then(function(result) {
        
        $('#portoni').html('');

        console.log(result);

        $('#doorset').val(result[0]);
        for (var i = 0; i < result[1]; i++) {
          //alert(i);
          $('#portoni').append('<div class="col-sm-4 door-container"><a data-id=' + i + '><div class="door"><div class="inner">' + i + '</div></div></a></div>');
        }
        $(".door").on("click", function(){
          //self.play($( this ).parent().data("id"));
          $('#door').val($( this ).parent().data("id"));
          $('#confirmModal').modal();
          console.log( $( this ).parent().data("id") );
        });        

        $("#btnInitPlay").hide();

       
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
      });
  },

  listenForEvents: function() {
    App.contracts.GioconePortone.deployed().then(function(instance) {
      instance.WonEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded

        var x = event.args["Prize"];
        var y = event.args["Bet"];
        var weiAmount = web3.toBigNumber(y);
        var etherValue = web3.fromWei(weiAmount,'ether');
        var z = event.args["Status"];
        console.log("status: ", z);
        console.log("prize: ", x.toString());
        if (z) {
          $("#message").html("Complimenti hai vinto " + x + " " + etherValue);
          $("#message").addClass("alert-success");
          $("#message").show();  
        } else {
          $("#message").html("Non hai vinto un cazzo");
          $("#message").addClass("alert-warning");
          $("#message").show();
        }
          
      });
    });
  }
}



$(function() {
  $(window).load(function() {
    App.init();
  });
});