/*
@Author Aline Souza
@version 1.0
@since 2018-06-26*
*/


// Call botbuilder and restify packages

var builder = require('botbuilder')
var restify = require('restify')


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

//Open session connector Options: Console or Chat


//Console connector
//var connector = new builder.ConsoleConnector().listen(); 


//Azure Connection credentials 
var appId= "9efa40ba-675c-484d-825d-e9d34bb9b802"; // AZ Azure Account 
var appPassword ="yZD436#{@etyqlvXYCST63$";


//Chat connector - running locally with BotFramework 
//var connector = new builder.ChatConnector();

//Connector for the Microsoft Azure Bot Service
var connector = new builder.ChatConnector({
		appId:appId,
		appPassword:appPassword});  



//Chat connector - APP Credentials
server.post('/api/messages',connector.listen()); 



// Init bot object
var bot = new builder.UniversalBot(connector);


// parsing the host / app details from Luis Application
var luisAppId= "3ba27d2c-66e6-4c8d-8e2d-902fad12bc36";
var luisAPIKey ="0bd11288f67344dba634ba7018751b1d";
var luisAPIHostName ="westus.api.cognitive.microsoft.com";
const luisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' +  luisAPIKey;




//Emoji Parsing

var smile = String.fromCharCode(0xD83D, 0xDE00);
var friendly = String.fromCharCode(0xD83D, 0xDE03);
var wink = String.fromCharCode(0xD83D,0xDE09);


//parsing the the model
var recognizer = new builder.LuisRecognizer(luisModelUrl);


// Intent dialog for luis recognizer 
var intents = new builder.IntentDialog({
	recognizers:[recognizer]
	
});

//connect intent dialog and the universal bot object
bot.dialog('/',intents);



// create handlers for each intent

//Intent: Greet English version
intents.matches('Greet_EN',(session,args,next) => {
	   console.log(JSON.stringify(args));
	  
       session.send("Hi there! I am your Help Desk bot. How may I help? " );
       
});

//Intent: Greet French version
intents.matches('Greet_FR',(session,args,next) => {
	   console.log(JSON.stringify(args));
   session.send("Bonjour! Je suis votre bot de Help Desk. Comment puis-je vous aider?");
});

//Intent: Greet Dutch version
intents.matches('Greet_NL',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send("Hallo! Ik ben je Help Desk-bot. Hoe kan ik u helpen?");
});


//Intent: Greet Portuguese version
intents.matches('Greet_PT',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send("Olá! Eu sou seu Help Desk bot. Como posso te ajudar?");
});


//Intent: Thanks
intents.matches('Thanks',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send( "You're welcome. See you next time! " + friendly);
});

var hardware = [
	"Mouse",
	"mobile phone",
	"printer",
	"keyboard"];


// Intent: Order 
intents.matches('Order_EN',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send("All right! I just need a few things to carry on your request");

var hardwareEntity = args.entities.filter(e => e.type == 'Hardware');

session.userData.hardwareUser = hardwareEntity[0].resolution.values[0];
session.beginDialog ('getOrder');	


});

// generate random number -> Future ServiceNow Ticket opening
var ticketnumber = Math.floor(Math.random()* (9999999 - 10000)+10000);

//Dialog for Intent : Order 
bot.dialog('getOrder',[
	
	(session,args,next) => {
	
     //ask username
	builder.Prompts.text(session, "What is your name?");
},(session,results)=> {
	//collects username 
	var username = session.userData.username= results.response;
	
	//ask user id
	builder.Prompts.text(session, "Thanks, " + username + " !" + " What is your User ID?");	
},(session,results)=> {
	//collects userid 
	var userid = session.userData.userid= results.response;
	session.send("Great! Your User Id is: " + userid);
	
	
	//ask to confirm choice 
	builder.Prompts.choice(session, "Please confirm you would like to order a " + session.userData.hardwareUser  + '\n', ["yes","no","you got it wrong"],{listStyle:builder.ListStyle.button});

	
	//saves and confirm choice
},(session,results)=> {
	var answer = session.userData.answer=[results.response.entity];
	if(answer == "yes"){
		 session.send("Thanks! Your request will be summarized and sent to an Agent!" + '\n' +  
				 "Here is your ticket number: " + ticketnumber + ". See you next time!");
	} else if (answer == "no") {
		session.send( "Oh! I am sorry about that! I'm going to transfer your request to a human. Here is your Ticket Number: " + ticketnumber);
				
	} else {
		session.send( "FATAL ERROR!!!! Just kidding!" + wink +  " I am going to pass your request to a human. Here is your ticket number: " + ticketnumber);
	}
	
	
}]); // End of Dialog "getOrder"



// Intent: Home office
intents.matches('Work_from_home',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send("Here is a list of the items you need to work from home: " + '\n' + 
		  " 1) Laptop or Desktop Computer " +  '\n'
		+ " 2) Broadband Connection (Wi-fi or network cable)" +  '\n' 
		+ " 3) Software RSA Token" +  '\n' 
		+ " 4) Citrix App" +  '\n' 
		+ " 5) Optional items: Mouse, Monitor, keyboard, printer, and docking station " + '\n'
		+ "** Attention : For Laptops T400 and X200 or newer please open an request to have Wireless enabled.**" );

session.beginDialog ('getWorkfromhome');	

});

// Dialog: home office

bot.dialog('getWorkfromhome',[
	
(session,args,next) => {
	
     //Ask User to Confirm Items 
builder.Prompts.choice(session, "Do you need any of these items to start working from home? " +
				 '\n', ["yes","no"],{listStyle:builder.ListStyle.button});

	//saves and confirm choice
},(session,results)=> {
	var answer = session.userData.answer=[results.response.entity];
	if(answer == "yes"){	
		session.beginDialog ('getItem');	
	}
			
	
	else if (answer == "no") {
		session.send( " All right then! Have fun and see you next time!");
				
	} else {
		session.send( "error");
	}
	
	
}]);


bot.dialog('getItem',[
	
	(session,args,next) => {
	builder.Prompts.choice(session,"These are the items I can order for you. Please pick the one you need: "+
			 '\n',
			  ["Laptop", "Citrix App","Docking Station"," Software RSA Token","Mouse"],{listStyle:builder.ListStyle.button});

	},	(session,results)=> {		
		var item = session.userData.answer=[results.response.entity];	
		
		builder.Prompts.text(session, "Great! I am going to order it for you! " + '\n' +
				"Order details = Item:  " + item + '\n' +
				"Your Ticket Number is: " + ticketnumber
				+ '\n' + "Our Team will start working on it right the way! " + smile);
					 
	}
		
	
	
]); // End of Intent: Home Office


intents.matches('Install',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send( "To install the AZ Connect Certificate follow these steps: " + '\n' + '\n' +
		"1. Load the Intranet Page www.page.com " + '\n' 
		+ "2. Enter the Allianz Email Address " + '\n' 
		+ "3. TAN will be forwarded to the mail address from Allianz Certification Authority" + '\n' 
		+ "4. Enter the TAN from the mail in the Column  " + '\n' 
		+ "5. GIN Certificate Installation completed ");

});

			
intents.matches('Configuration_index',(session,args,next) => {
	   console.log(JSON.stringify(args));
session.send( "To locate your CI Number, please follow these steps: " + '\n' + '\n' +
		"1. Click on the Start menu " + '\n' 
		+ "2. Right-click with the mouse and choose 'My Computer' " + '\n' 
		+ "3. In the drop down menu, click on Properties" + '\n' 
		+ "4. On the System Properties window click on the tab 'Computer Name'  " + '\n' 
		+ "5. You will find the CI number under the Full Computer name ");

});





// ++ FURTHER FUNCTIONALITIES ++ 

/*
intents.matches('Ordering',[(session,args,next) => {
console.log(JSON.stringify(args));

    // check if array not empty
    
    if(hardwareEntity.length>0) {
    	
    	//get first element of the array Entity Hardware e.g. Mouse
    	session.userData.hardware= hardwareEntity[0].resolution.values[0];
    	
    } else {
    	
    	delete session.userData.hardware;
    	
    }
    
    // get first element of the array Applications e.g. outlook
    
if(appEntity.length>0) {
    	
    	//get first element of the array Hardware e.g. Mouse
    	session.userData.applications= appEntity[0].resolution.values[0];
    	
    } else {
    	
    	delete session.userData.applications;
    	
    }
//In case hardware cannot be found, show a list of hardware
if(!session.userData.hardware) { 
	session.beginDialog('askHardware');

}
else {
	next();
}
},(session,args,next) => {

if(!session.userData.applications) { 
	session.beginDialog('askApplication');

} else {
next();
} 
}, (session,args,next)=> {
session.send("Ok! I will order it right the way ");
}]);


//Creates a dialog handler for Hardware
bot.dialog('askHardware',[(session,args,next)=>  {
		  builder.Prompts.choice(session,'I am sorry, but I could not find the hardware you need. Please pick one from the list',hardware);
	 }, (session, results) => {
		 session.userData.hardware=results.response.entity;
		 session.endDialogWithResult(results);
	

	 }]);

//create a dialog handler for Applications 
	 bot.dialog('askApplication',[(session,args,next)=>  {
		  builder.Prompts.choice(session,'I cannot find the application you need. Please pick one from the list', applications);
	 }, (session, results) => {
		 session.userData.applications=results.response.entity;
		 session.endDialogWithResult(results);
	

	 }]); 

	 /* Greeting starts + Dialog
	var bot = new builder.UniversalBot(connector, function (session) {
	    session.send("Hello there! I am your virtual assistant!"),
	    session.beginDialog('setHelp')  ;
	});

	//Waterfall model - Sequence of steps 
	bot.dialog('setHelp', [(session,args,next)=> {
		builder.Prompts.text(session,"Before we start, could you tell me your User ID?");
		},(session,results)=> {
			session.userData.userid= results.response;
			builder.Prompts.text(session,"Great! And what is your name?");
		},(session, results)=> {
			session.userData.name=results.response;
			builder.Prompts.choice(session,"Thanks, " + session.userData.name + "!. Do you have a PASSWORD problem?",["yes","no"])
		},(session, results) =>{
			session.userData.passwordbool = results.response.entity; */
