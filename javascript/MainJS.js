var strSubmitThankYou = "<div id='divSearchReset'><h3>Thank you!</h3><h4>Thank you for submitting this issue and congratulations on taking a step towards local empowerment. </h4><a href='Submit.html'>Submit Another Issue</a></div>";//holds the thank you message so to function can use it togetther

//Device functions

//alert dialog dismissed
function alertDismissed()
{
}//end of alertDismissed()

//Phonegap functions

//gets the photo libery for this device for the user to select it
function getPhoto(source) 
{
	//Retrieve image file location from specified source
	navigator.camera.getPicture(photoURISuccess, onFail, { quality: 50, destinationType: destinationType.FILE_URI, sourceType: source });
}//end of getPhoto()

//finds the user current postions and starge it for use if successfully retrieved
function gpsPositionSubmit(position) 
{
	//gets the label for displaying the results of the postions
	var tagNears = getDocID("divNears");//holds the label of Nears Address
	var tagRequiredContent = getDocID("divRequiredContent");//holds the label that tells the user of Neears Address
	var strMessageID = "divDataMessage";//holds the id of the Message Div
	
	window.localStorage.setItem("strGPSPositionLongitude", position.coords.longitude);
	window.localStorage.setItem("strGPSPositionLatitude", position.coords.latitude);
	
	//Checks if there is an Nears Address label to use as well as the label for it
	if (tagNears != "" && tagRequiredContent != "")
	{
		var htmlJavaServerObject = new XMLHttpRequest();
		
		//Abort any currently active request.
		htmlJavaServerObject.abort();
		
		//prepers the form for sending
		preSendEMail(strMessageID);
		
		//Makes a request - Gets function is need get the data from remote site
		htmlJavaServerObject.open("Post", '', true);
		htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

		htmlJavaServerObject.onreadystatechange = function(){
			if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
			{
				try
				{		
					var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
				
					//checks if there is a message from the server
					if(arrActullyEndMassage.length >= 2)
					{
						var arrAddress = arrActullyEndMassage[1].split(",");//holds each item of an Address that google brought back from its search
						var tagGeocomplete = getDocID("txtGeocomplete");//holds the textbox of the address the user is looking for
			
						//trims the spaces around the Postal Code and Province
						arrAddress[2] = arrAddress[2].trim();
						
						//checks if are the labels need to holde the address and its loactoin
						if (tagGeocomplete != "")
							tagGeocomplete.value = arrActullyEndMassage[1];
						
						//displays the map and the next step
						$(".divMapCanvas").show();
						$("#divNextStep").show();
						
						//turn on the locatoin funcation
						$("#txtGeocomplete").trigger("geocode");
						
						//changes the page to display the nears address as well as a way to clear the results and go back to the way it was			
						tagNears.innerHTML = "<label>Address: " + arrAddress[0] + "<br/>City: " + arrAddress[1] + ", " + arrAddress[2].substring(0, arrAddress[2].indexOf(" ")) + "</label><br/><br/><a href='javascript:void(0);' onclick='changeDisplay(&quot;divPosition&quot;,&quot;&quot;);getDocID(&quot;divRequiredContent&quot;).innerHTML = &quot;<label class=&acute;lblFontGreen lblFontBold&acute;>Problem Location:</label>&quot;;getDocID(&quot;divNears&quot;).innerHTML=&quot;&quot;;changeDisplay(&quot;divSubmitAddressInter&quot;,&quot;&quot;);getDocID(&quot;txtGeocomplete&quot;).value=&quot;&quot;;$(&quot;.divMapCanvas&quot;).hide();$(&quot;#divNextStep&quot;).hide();'>Enter Address Manual</a><br/>";
						tagRequiredContent.innerHTML = "<label>Nearest Address</label>";
						
						//hides the Address and Intersection as they are no longer need and displays the Nears Address
						changeDisplay('divPosition','block');
						changeDisplay('divSubmitAddressInter','none');
												
						displayMessage(strMessageID,"",true,true);
					}//end for if
					else
						//tells the user that there is an error with the Server
						displayMessage(strMessageID,"Unable to Get Address",true,true);
				}//end of try
				catch(ex)
				{
					//tells the user that there is an error with the Server
					displayMessage(strMessageID,"GPS Error: " + ex.description,true,true);
				}//end of catch
			}//end of if
			else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
				//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
				endMessage('<head></head>Unable to Connect to the Server.</head>',strMessageID);
		}//end of function()
		
		htmlJavaServerObject.send("strLongitude=" + encodeURL(encryptRSA(window.localStorage.getItem("strGPSPositionLongitude"))) + "&strLatitude=" + encodeURL(encryptRSA(window.localStorage.getItem("strGPSPositionLatitude"))));
	}//end of if
}//end of gpsPositionSubmit()

//Called when a video is successfully retrieved
function videoSuccess(videoData) 
{	
	getDocID('videoSumbit').style.display = 'block';
	getDocID('videoSumbitSource').src = videoData;
}//end of videoSuccess()

//uploads the Files to the Server
function uploadFile(mediaFile,intSumbitIssuesID,intImageSize) 
{
    var options = new FileUploadOptions();//holds the file upload options
	var strFileID = mediaFile.id;//holds the media file id
	
    options.fileKey = "recMedia";//the key need to get the data when it arrives on the server
    options.fileName = Number(new Date()) + mediaFile.src.name;//holds the name of the file
		
	//checks if the mediaFile is imgSumbitThumb and the intImageSize is 410 meaning it should go to the Photo 1
	//as thumbnail has to go to both the thumbnail and the intImageSize
	if(strFileID == "imgSumbitThumb" && intImageSize == 410)
		strFileID = "imgSumbitPhoto1";
		
	console.log("File Name = " + mediaFile.src.name);
	console.log("Image Size = " + intImageSize);
	console.log("File ID = " + strFileID);

    var params = new Object();//adds the any optionly perments
    params.IssueID = intSumbitIssuesID;
	params.ImageFieldID = strFileID;
	params.ImageSize = intImageSize;
    options.params = params;
	
	//adds the amount that was sent to the sever in order to know when how many photos is being uploaded
	window.localStorage.setItem("intFileSent", (parseInt(window.localStorage.getItem("intFileSent")) + 1) + '');
	
	console.log("File sent being uploaded success: " + window.localStorage.getItem("intFileSent"));
	
    var ft = new FileTransfer();//holds the object ot send data to the server

	//sends the data to the server
	ft.upload(mediaFile.src, "Upload", uploadSuccess, onUploadFail, options);
}//end of uploadFile()

function uploadSuccess(message) 
{
	console.log("Code = " + message.responseCode);
	console.log("Response = " + message.response);
	console.log("Sent = " + message.bytesSent);
	
	var arrActullyEndMassage = message.response.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
					
	//checks if there is a message from the server
	if(arrActullyEndMassage.length >= 2)
	{
		//remove the amount that was sent
		window.localStorage.setItem("intFileSent",  (parseInt(window.localStorage.getItem("intFileSent")) - 1) + '');
		
		console.log("File sent current: " + window.localStorage.getItem("intFileSent"));
		
		var tagBody = getDocID('divSubmit');//holds the label of the of the body
		
		//checks if the body in on the page
		if(tagBody != null && parseInt(window.localStorage.getItem("intFileSent")) <= 0)
			///tells the user thank you and allows them to submit another issue
			tagBody.innerHTML = strSubmitThankYou;
		else
			//displays to the user how many files being uploaded
			displayMessage('divMessage',"Issue Submited\n" + window.localStorage.getItem("intFileSent") + " files being uploaded",true,true);
	}//end of if
	else
		//tells the user that the Login has failured
		displayMessage('divMessage',arrActullyEndMassage[1],true,true);
}//end of uploadSuccess()

function onUploadFail(error) 
{
	//displays and Alert to the user
	navigator.notification.alert('Unable To Upload File',alertDismissed,'Alert','OK');
	
	//displays the error to the console
	console.log("An Upload error has occurred:\nCode: " + error.code + "\nMessage: " + error.message,alertDismissed);
}//end of onUploadFail()

function uploadProgress(loaded, total) 
{
	var percent = 100 / total * loaded;
	console.log('Uploaded  ' + percent);
}//end of uploadProgress()

function onFail(error) 
{	
	//displays the error to the console
	console.log("An GPS error has occurred:\nCode: " + error.code + "\nMessage: " + error.message,alertDismissed);
}//end of onFail()

function onGPSFail(error) 
{
	//checks the code if the code is a 2 meaning location is not in service
	//or three meaning the a timeout error has orrured
	if(error.code == 2)
	{
		//displays and Alert to the user
		navigator.notification.alert('Location Service is Turn Off\nGo to Settings->Location Services and turn on RYC',alertDismissed,'Alert','OK');
	}//end of if
	else if(error.code == 3)
	{
		//displays and Alert to the user
		navigator.notification.alert('Unable to Find Location',alertDismissed,'Alert','OK');		
	}//end of else if
	else
	{
		//displays and Alert to the user
		navigator.notification.alert(error.message,alertDismissed,'Alert','OK');
	}//end of else
	
	//displays the error to the console
	console.log("An GPS error has occurred:\nCode: " + error.code + "\nMessage: " + error.message,alertDismissed);
}//end of onGPSFail()

//Check network status
function reachableCallback()
{
	var networkState = navigator.network.connection.type;

	var states = {};
	states[Connection.UNKNOWN]  = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI]     = 'WiFi connection';
	states[Connection.CELL_2G]  = 'Cell 2G connection';
	states[Connection.CELL_3G]  = 'Cell 3G connection';
	states[Connection.CELL_4G]  = 'Cell 4G connection';
	states[Connection.NONE]     = 'No network connection';

	return states[networkState];
}//end of reachableCallback()

//Submit Photos Functions

//Called when a photo is successfully retrieved
function photoDataSuccessThumb(imageData)
{
  //Get image handle
  var imgSumbit = getDocID('imgSumbitThumb');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = "data:image/jpeg;base64," + imageData;
  //getDocID('aSumbitThumb').style.display = 'block';
}//end of photoDataSuccessThumb()

//Called when a photo is successfully retrieved
function photoURISuccessThumb(imageURI) 
{
  var imgSumbit = getDocID('imgSumbitThumb');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = imageURI;
  //getDocID('aSumbitThumb').style.display = 'block';
}//end of photoURISuccessThumb()

//Called when the Confirm Which Button is being press
function onRemoveThumbPhotoClick(button) 
{
	//checks if the anwser is yes and if so then remove the image
	if(button == 1)
		getDocID('imgSumbitThumb').src = '';
}//end of onRemoveThumbPhotoClick()

//Called when a photo is successfully retrieved
function photoDataSuccessPhoto1(imageData)
{
  var imgSumbit = getDocID('imgSumbitPhoto1');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = "data:image/jpeg;base64," + imageData;
  //getDocID('aSumbitPhoto1').style.display = 'block';
}//end of photoDataSuccessPhoto1()

//Called when a photo is successfully retrieved
function photoURISuccessPhoto1(imageURI) 
{
  var imgSumbit = getDocID('imgSumbitPhoto1');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = imageURI;
  //getDocID('aSumbitPhoto1').style.display = 'block';
}//end of photoURISuccessPhoto1()

//Called when the Confirm Which Button is being press
function onRemovePhoto1Click(button) 
{
	//checks if the anwser is yes and if so then remove the image
	if(button == 1)
		getDocID('imgSumbitPhoto1').src = '';
}//end of onRemovePhoto1Click()

//Called when a photo is successfully retrieved
function photoDataSuccessPhoto2(imageData)
{
  var imgSumbit = getDocID('imgSumbitPhoto2');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = "data:image/jpeg;base64," + imageData;
}//end of photoDataSuccessPhoto2()

//Called when a photo is successfully retrieved
function photoURISuccessPhoto2(imageURI) 
{
  var imgSumbit = getDocID('imgSumbitPhoto2');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = imageURI;
  //getDocID('aSumbitPhoto2').style.display = 'block';
}//end of photoURISuccessPhoto2()

//Called when the Confirm Which Button is being press
function onRemovePhoto2Click(button) 
{
	//checks if the anwser is yes and if so then remove the image
	if(button == 1)
		getDocID('imgSumbitPhoto2').src = '';
}//end of onRemovePhoto2Click()

//Called when a photo is successfully retrieved
function photoDataSuccessPhoto3(imageData)
{
  var imgSumbit = getDocID('imgSumbitPhoto3');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = "data:image/jpeg;base64," + imageData;
  //getDocID('aSumbitPhoto3').style.display = 'block';
}//end of photoDataSuccessPhoto3()

//Called when a photo is successfully retrieved
function photoURISuccessPhoto3(imageURI) 
{
  var imgSumbit = getDocID('imgSumbitPhoto3');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = imageURI;
  //getDocID('aSumbitPhoto3').style.display = 'block';
}//end of photoURISuccessPhoto3()

//Called when the Confirm Which Button is being press
function onRemovePhoto3Click(button) 
{
	//checks if the anwser is yes and if so then remove the image
	if(button == 1)
		getDocID('imgSumbitPhoto3').src = '';
}//end of onRemovePhoto3Click()

//Called when a photo is successfully retrieved
function photoDataSuccessPhoto4(imageData)
{
  var imgSumbit = getDocID('imgSumbitPhoto4');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = "data:image/jpeg;base64," + imageData;
  //getDocID('aSumbitPhoto4').style.display = 'block';
}//end of photoDataSuccessPhoto4()

//Called when a photo is successfully retrieved
function photoURISuccessPhoto4(imageURI) 
{
  var imgSumbit = getDocID('imgSumbitPhoto4');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = imageURI;
  //getDocID('aSumbitPhoto4').style.display = 'block';
}//end of photoURISuccessPhoto4()

//Called when the Confirm Which Button is being press
function onRemovePhoto4Click(button) 
{
	//checks if the anwser is yes and if so then remove the image
	if(button == 1)
		getDocID('imgSumbitPhoto4').src = '';
}//end of onRemovePhoto4Click()

//Called when a photo is successfully retrieved
function photoDataSuccessPhoto5(imageData)
{
  var imgSumbit = getDocID('imgSumbitPhoto5');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = "data:image/jpeg;base64," + imageData;
  //getDocID('aSumbitPhoto5').style.display = 'block';
}//end of photoDataSuccessPhoto5()

//Called when a photo is successfully retrieved
function photoURISuccessPhoto5(imageURI) 
{
  var imgSumbit = getDocID('imgSumbitPhoto5');//holds the Image for the user to see it

  imgSumbit.style.display = 'block';
  imgSumbit.src = imageURI;
  //getDocID('aSumbitPhoto5').style.display = 'block';
}//end of photoURISuccessPhoto5()

//Called when the Confirm Which Button is being press
function onRemovePhoto5Click(button) 
{
	//checks if the anwser is yes and if so then remove the image
	if(button == 1)
		getDocID('imgSumbitPhoto5').src = '';
}//end of onRemovePhoto5Click()

// JavaScript Document

//Adds text to any part of the body of a HTML
function addNode(tagParent,strText,boolAddToBack, boolRemoveNode)
{
  var strNode = document.createTextNode(strText);//holds the test which will be added
     
  //gets the properties of the node
  tagParent = getDocID(tagParent);
  
  //checks if the user whats to replace the node in order to start with a clean slate
  //it also checks if there is a chode node to replace
  if (boolRemoveNode == true && tagParent.childNodes.length > 0)
	//replaces the current node with what the user wants
	tagParent.replaceChild(strNode,tagParent.childNodes[0]);
  else
  {
  	//checks if the user whats to added to the back of the id or the front
  	if(boolAddToBack == true)
		tagParent.appendChild(strNode);
  	else
		//This is a built-in function of Javascript will add text to the beginning of the child
  		insertBefore(strNode,tagParent.firstChild);
  }//end of if else
  
  //returns the divParent in order for the user to use it for more uses
  return tagParent;
}//end of addNode()

//removes from view all tags in tagContainer with the expection of tagActive
//It assumes the tagActive and tagContiner already have the properties
function classToggleLayer(tagContainer,tagActive,strClassName,strTAGName)
{
	var arrTAG = tagContainer.getElementsByTagName(strTAGName);//holds all strTAGName in tagContainer
	
	//goes around the for each tag that getElementsByTagName found in tagContainter
	for(var intIndex = arrTAG.length - 1; intIndex > -1; intIndex--) 
	{
		//checks if the class name is the same as strClassName and it is not active if it is active then change the dispaly to block
		if(arrTAG[intIndex].className == strClassName && arrTAG[intIndex].id != tagActive.id)
			arrTAG[intIndex].style.display = arrTAG[intIndex].style.display? "":"";
		else if(arrTAG[intIndex].id == tagActive.id && tagActive.style.display == "")
			arrTAG[intIndex].style.display = arrTAG[intIndex].style.display? "":"block";
	}//end of for loop
}//end of classToggleLayer()

//Changes the display to either off or on
function changeDisplay(tagLayer,strDisplay)
{
	tagLayer = getDocID(tagLayer);//holds the active Layer
	
	//Checks if there is an active layer
	if (tagLayer != "")
		tagLayer.style.display = strDisplay;	
}//end of changeDisplay()

//change the select option from tagSelect to what is strSelectValue
function changeSelectOption(tagSelect,strSelectValue)
{
	var strSelectOption = "";//holds the select option the user has choosen
	
	//goes around finding the current seleted value from tagSelection
	for (var intIndex = 0;intIndex < tagSelect.options.length; intIndex++)
	{
		if (tagSelect.options[intIndex].value == strSelectValue)
			tagSelect.options[intIndex].selected = true;
	}//end of for loop
}//end of changeSelectOption()

//Changes the tagActive Class to have the an Select only class so that the tagActive will look different from the rest
//It assumes the tagActive and tagContiner already have the properties
function classToggleLayerChangeClass(tagContainer,tagActive,strClassName,strActiveClassName,strTAGName)
{
	var arrTAG = tagContainer.getElementsByTagName(strTAGName);//holds all strTAGName in tagContainer
	
	//goes around the for each tag that getElementsByTagName found in tagContainter
	for(var intIndex = arrTAG.length - 1; intIndex > -1; intIndex--) 
	{
		//checks if the class name is the same as strClassName and it is not active if it is active then adds an strActiveClassName
		if(arrTAG[intIndex].id != tagActive.id)
			arrTAG[intIndex].className = strClassName;
		else if(arrTAG[intIndex].id == tagActive.id)
			arrTAG[intIndex].className = strActiveClassName;
	}//end of for loop
}//end of classToggleLayerChangeClass()

//does the display the a message in a on the page weather then an alert
function displayMessage(tagMessage,strMessText,boolAddToBack, boolRemoveNode)
{
	//gets the message properties and sets the text furthermore it does the display
	tagMessage = addNode(tagMessage,strMessText,boolAddToBack, boolRemoveNode);
	tagMessage.style.display = "block";	
	
	return tagMessage;
}//end of displayMessage()

//this is for the duel layers that sometimes is need
function duelToggleLayer(whichLayer,layer1,layer2)
{
	var activeLayer = "";//holds the active Layer	
	var style2 = "";//holds the style of layer1
	var style3 = "";//holds the style of layer2

	// this is the way the standards work
	if (whichLayer != ''){activeLayer = getDocID(whichLayer);}
	if (layer1 != ''){style2 = getDocID(layer1);}
	if (layer2 != ''){style3 = getDocID(layer2);}

	//Checks if there is an active layer
	if (activeLayer != "")
	{
		//checks if the activeLayer is already active and if so then skips code
		//since the layer cannot be turn off and leave a hole in the review layer
		if (activeLayer.style.display == "")
		{
			//removes the block from the display in order to make the layer to disapper	
			if (style2 != ''){style2.style.display = style2.style.display? "":"";}

			//checks if there is a style3
			if (style3 != ''){style3.style.display = style3.style.display? "":"";}
	
			//displays the new active Layer and updates its id
			activeLayer.style.display = activeLayer.style.display? "":"block";
		}//end of if
	}//end of if
}//end of duelToggleLayer()

//encodes str to a URL so it can be sent over the URL address
function encodeURL(strEncode)
{
	var strResult = "";
	
	for (intIndex = 0; intIndex < strEncode.length; intIndex++)
	{
		if (strEncode.charAt(intIndex) == " ") strResult += "+";
		else strResult += strEncode.charAt(intIndex);
	}//end of for loop
	
	return escape(strResult);
}//end of encodeURL()

//gives the user the message has been sent or not and changes the pop area
function endMessage(strEndMessage,tagMessage)
{
	var arrActullyEndMassage = strEndMessage.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
	
	//adds some text to the div tag and then displays it to the user
	displayMessage(tagMessage,arrActullyEndMassage[1],true,true);
}//end of endMessage()

//gets the document properties in order to use them as there are many types of browers with different versions
function getDocID(tagLayer)
{
	var tagProp = "";//holds the proerties of tagLayer
	
	//gets the whichLayer Properties depending of the differnt bowers the user is using
	if (document.getElementById)//this is the way the standards work
		tagProp = document.getElementById(tagLayer);
	else if (document.all)//this is the way old msie versions work
		tagProp = document.all[tagLayer];
	else if (document.layers)//this is the way nn4 works
		tagProp = document.layers[tagLayer];
			   
	return tagProp;			
}//end of getDocID()

//gets the radio button option from tagSelect
function getRadioCheck(tagSelect)
{
	var strSelectOption = "";//holds the select option the user has choosen

	//goes around finding the current seleted value from tagSelection
	for (var intIndex = 0;intIndex < tagSelect.length; intIndex++)
	{
		if (tagSelect[intIndex].checked == true)
			strSelectOption = tagSelect[intIndex].value;
	}//end of for loop
	
	return strSelectOption;
}//end of getRadioCheck()

//gets the select option from tagSelect
function getSelectOption(tagSelect)
{
	var strSelectOption = "";//holds the select option the user has choosen
	
	//goes around finding the current seleted value from tagSelection
	for (var intIndex = 0;intIndex < tagSelect.options.length; intIndex++)
	{
		if (tagSelect.options[intIndex].selected == true)
			strSelectOption = tagSelect.options[intIndex].value;
	}//end of for loop
	
	return strSelectOption;
}//end of getSelectOption()

//set up the form to not be used while sending the message
function preSendEMail(tagMessage)
{
	//display to the user their message is beening sent and disables the textbox area
	displayMessage(tagMessage,'Please Wait...',true,true);
	//tagEMailBody.style.display = 'none';
}//end of preSendEMail()

//gets the data
function sendGetData(strFileName,tagMessage,strTable,strSort,tagSelection,tagPageBody)
{
	var htmlJavaServerObject = new XMLHttpRequest();
		
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the data gotten from the server to tagSelection
				//tagSelection.innerHTML = arrActullyEndMassage[1];

				displayMessage(tagMessage,"",true,true);
			}//end for if
			else
			{
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get Data",true,true);
				
				//removes the body as the connection could not be made and thus cannot get the data
				tagPageBody.style.display = 'none';
			}//end of else
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
			
			//removes the body as the connection could not be made and thus cannot get the data
			tagPageBody.style.display = 'none';
		}//end of else if
	}//end of function()

	htmlJavaServerObject.send("strTable=" + encodeURL(encryptRSA(strTable)) + "&strSort=" + encodeURL(encryptRSA(strSort)));
	
	return true;
}//end of sendGetData()

//gets the pages
function sendGetPage(strFileName,tagMessage,strPageName,tagPages)
{
	var htmlJavaServerObject = new XMLHttpRequest();
		
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the body of the what comes from the server
				tagPages.innerHTML = arrActullyEndMassage[1];

				displayMessage(tagMessage,"",true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get Page",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()

	htmlJavaServerObject.send("strPage=" + encodeURL(encryptRSA(strPageName)));
	
	return true;
}//end of sendGetPage()

//gets the Cities for the Province
function sendGetCity(strFileName, tagMessage, tagProvince, tagCity, tagWardArea, strSelectedCity)
{
	var htmlJavaServerObject = new XMLHttpRequest();
		
	//Abort any currently active request.
	htmlJavaServerObject.abort();

	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the body of the what comes from the server
				tagCity.innerHTML = "<option value='' selected='selected'>All</option>" + arrActullyEndMassage[1];
				
				//checks if the Selected city is toronto if so then display the Ward selecteion
				if(tagWardArea == null && getSelectOption(tagCity) == '16' && getSelectOption(tagProvince) == '3')
					tagWardArea.style.display = 'block';
				else if(tagWardArea == null)
					tagWardArea.style.display = 'none';

				displayMessage(tagMessage,"",true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get City",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()

	htmlJavaServerObject.send("strPro=" + encodeURL(encryptRSA(getSelectOption(tagProvince))) + "&strSelectedCity=" + encodeURL(encryptRSA(strSelectedCity)));
	
	return true;
}//end of sendGetCity()

//gets the DropDowns Values
function sendGetDropDownsValues(strFileName,tagMessage,tagDropDowns)
{
	var htmlJavaServerObject = new XMLHttpRequest();
	
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the body of the what comes from the server
				tagDropDowns.innerHTML = arrActullyEndMassage[1];

				displayMessage(tagMessage,"",true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get Region",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()

	htmlJavaServerObject.send("strSelected=" + encodeURL(encryptRSA(getSelectOption(tagDropDowns))));
	
	return true;
}//end of sendGetDropDownsValues()

//gets the Map
function sendGetMap(strFileName,tagMessage,intPro,intCity,intWard,tagMap)
{	
	//resets the map
	tagMap.src = "";
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//resets the map
	tagMap.src = strFileName + "?strPro=" + encodeURL(encryptRSA(intPro)) + "&strCity=" + encodeURL(encryptRSA(intCity)) + "&strWard=" + encodeURL(encryptRSA(intWard));
	
	displayMessage(tagMessage,"",true,true);
	
	return true;
}//end of sendGetMap()

//gets the Users Profile
function sendGetProfile(strFileName,tagMessage,tagUser,tagProfile)
{
	var htmlJavaServerObject = new XMLHttpRequest();
		
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the body of the what comes from the server
				tagProfile.innerHTML = arrActullyEndMassage[1];

				displayMessage(tagMessage,"",true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get Your Profile",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()

	htmlJavaServerObject.send("intUser=" + encodeURL(encryptRSA(window.localStorage.getItem("intUserID"))));
	
	return true;
}//end of sendGetProfile()

//gets the Issues Details
function sendGetIssueDetails(strFileName,tagMessage,intIssue,tagIssue)
{
	var htmlJavaServerObject = new XMLHttpRequest();
			
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the body of the what comes from the server
				tagIssue.innerHTML = arrActullyEndMassage[1];

				displayMessage(tagMessage,"",true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get Issue",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()

	htmlJavaServerObject.send("intIssue=" + encodeURL(encryptRSA(intIssue)));
	
	return true;
}//end of sendGetIssueDetails()

//gets the what sports the user has choosen to get
function sendGetSearchResults(strFileName, tagMessage, tagKeyword, tagAddress, tagAddressNumber, tagInsersection1, tagInsersection2, ddlPro, ddlCity, tagDate1, tagDate2, tagSearchResults, tagSearchTextIntro, tagSearchBack)
{
	var htmlJavaServerObject = new XMLHttpRequest();
			
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//Puts the body of the what comes from the server
				tagSearchResults.innerHTML = arrActullyEndMassage[1];
				
				//displays the Back button to search again
				tagSearchBack.style.display = "block";
				displayMessage(tagMessage,"",true,true);
				
				//checks if if there is a Search Text Intro text
				if(tagSearchTextIntro != null)
					//remvoes the Search Intro in order to give a bigger search area
					tagSearchTextIntro.style.display = "none";
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to Get Any Sports Events",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()
	
	htmlJavaServerObject.send("strKeyword=" + encodeURL(encryptRSA(tagKeyword.value)) + "&strAddressNumber=" + encodeURL(encryptRSA(tagAddressNumber.value)) + "&strAddress=" + encodeURL(encryptRSA(tagAddress.value)) + "&strInsersection1=" + encodeURL(encryptRSA(tagInsersection1.value)) + "&strInsersection2=" + encodeURL(encryptRSA(tagInsersection2.value)) + "&strPro=" + encodeURL(encryptRSA(getSelectOption(ddlPro))) + "&strCity=" + encodeURL(encryptRSA(getSelectOption(ddlCity))));//+ "&strDate1=" + encodeURL(encryptRSA(tagDate1.value)) + "&strDate2=" + encodeURL(encryptRSA(tagDate2.value))
	
	return true;
}//end of sendGetSearchResults()

//Login to the site
function sendLogin(strFileName,tagMessage,tagUserName,tagPassword)
{
	var htmlJavaServerObject = new XMLHttpRequest();
		
	//checks if there is a User Name
	if (tagUserName.value=="")
  		{displayMessage(tagMessage,"Please make sure to enter your user name.",true,true);
			return false;}

	//checks if there is a Password
	if (tagPassword.value=="")
  		{displayMessage(tagMessage,"Please make sure to enter your password.",true,true);
			return false;}
	
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//checks if the user enter the corrent login and if so then go to the next page
				if(isNaN(arrActullyEndMassage[1].trim()) == false && parseInt(arrActullyEndMassage[1].trim()) > 0)
                {
					//gets the User ID for future use and send the user to the home screen
					window.localStorage.setItem("intUserID", parseInt(arrActullyEndMassage[1].trim()));
					window.location = 'index.html';
                }//end of if
				else
					//tells the user that the Login has failured
					displayMessage(tagMessage,arrActullyEndMassage[1],true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to get login to site",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
		{
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
		}//end of else if
	}//end of function()
	
	htmlJavaServerObject.send("txtUserName=" + encodeURL(encryptRSA(tagUserName.value)) + "&txtPassword=" + encodeURL(encryptRSA(tagPassword.value)));
	
	return true;
}//end of sendLogin()

//Register to the site
function sendRegister(strFileName,tagMessage,tagUserName,tagPassword,tagConPassword,tagFirstName,tagLastName,tagDisplayName,tagEMail,tagPhoto,tagAddress,tagCity,ddlProvince,tagPostalCode,tagBiography)
{
	var strEmailFilter = /^.+@.+\..{2,3}$/;//holds the filtter for the Email
	var strPostalCodeFilter = /[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/;//holds the filtter for the Postal Code
	//var strAddressFilter = /^.+@.+\..{2,3}$/;//holds the filtter for the Address
	var htmlJavaServerObject = new XMLHttpRequest();
		
	//checks if there is a User Name
	if (tagUserName.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your user name.",true,true);
			return false;}
			
	//checks if there is a First Name
	if (tagFirstName.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your first name.",true,true);
			return false;}
			
	//checks if there is a Last Name
	if (tagLastName.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your last name.",true,true);
			return false;}
			
	//checks if there is a Display Name
	if (tagDisplayName.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your display name.",true,true);
			return false;}
			
	//checks if there is a Email
	if (tagEMail.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your email.",true,true);
			return false;}
	
	//checks if the Email Format is current
	if (strEmailFilter.test(tagEMail.value) == false)
		{displayMessage(tagMessage,"The email address " + tagEMail.value + " is not valid.",true,true) ;
			return false;}
	else if (tagEMail.value.match(/[\(\)\<\>\,\;\:\\\/\"\[\]]/))
		{displayMessage(tagMessage,"The email address " + tagEMail.value + " contains illegal characters.", true, true);
			return false;}
	
	//checks if there is a Password
	if (tagPassword.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your password.",true,true);
			return false;}
		
	//checks if there is a Password and Confirm Password matches
	if (tagPassword.value != tagConPassword.value)
  		{displayMessage(tagMessage,"Your password and confirm password does not match.",true,true);
			return false;}
			
	//checks if the Street Address Format is current
	/*if (tagAddress.value != "" && strAddressFilter.test(tagAddress.value) == false)
		{displayMessage(tagMessage,"The street address is not valid.",true,true) ;
			return false;}*/
				
	//checks if there is a City
	if (tagCity.value == "")
  		{displayMessage(tagMessage,"Please make sure to enter your city.",true,true);
			return false;}
			
	//checks if the Postal Code Format is current
	if (tagPostalCode.value != "" && strPostalCodeFilter.test(tagPostalCode.value) == false)
		{displayMessage(tagMessage,"The postal code format is not valid",true,true) ;
			return false;}
	
	//Abort any currently active request.
	htmlJavaServerObject.abort();
	
	//prepers the form for sending
	preSendEMail(tagMessage);
	
	//Makes a request - Gets function is need get the data from remote site
	htmlJavaServerObject.open("Post", strFileName, true);
	htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");

	htmlJavaServerObject.onreadystatechange = function(){
		if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
		{			
			var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
		
			//checks if there is a message from the server
			if(arrActullyEndMassage.length >= 2)
			{
				//checks if the user enter the corrent login and if so then go to the next page
				if(isNaN(arrActullyEndMassage[1].trim()) == false && parseInt(arrActullyEndMassage[1].trim()) > 0)
                {
					//log the user to the site
					 sendLogin('',tagMessage,tagUserName,tagPassword);
                }//end of if
				else
					//tells the user that the Login has failured
					displayMessage(tagMessage,arrActullyEndMassage[1],true,true);
			}//end for if
			else
				//tells the user that there is an error with the Server
				displayMessage(tagMessage,"Unable to get register to the site",true,true);
		}//end of if
		else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
			//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
			endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
	}//end of function()
	
	htmlJavaServerObject.send("strUserName=" + encodeURL(encryptRSA(tagUserName.value)) + "&strPassword=" + encodeURL(encryptRSA(tagPassword.value)) + "&strFirstName=" + encodeURL(encryptRSA(tagFirstName.value)) + "&strLastName=" + encodeURL(encryptRSA(tagLastName.value)) + "&strDisplayname=" + encodeURL(encryptRSA(tagDisplayName.value)) + "&strEMail=" + encodeURL(encryptRSA(tagEMail.value)) + "&strAddress=" + encodeURL(encryptRSA(tagAddress.value)) + "&strCity=" + encodeURL(encryptRSA(getSelectOption(tagCity))) + "&strProvince=" + encodeURL(encryptRSA(getSelectOption(ddlProvince))) + "&strPostalCode=" + encodeURL(encryptRSA(tagPostalCode.value)) + "&strBiography=" + encodeURL(encryptRSA(tagBiography.value)));//"&strPhoto=" + encodeURL(encryptRSA(tagPhoto.value)) +
	
	return true;
}//end of sendRegister()

//Submit Issues to the site
function sendSubmit(strFileName,tagMessage,tagFullAddress,tagLocatoinLat,tagLocatoinLng,tagName,ddlAssignment,tagDescription,tagAnonymous,tagIssueTags,tagAgreeTerms,tagThumbPhoto,tagPhoto1,tagPhoto2,tagPhoto3,tagPhoto4,tagPhoto5,tagVideo,tagBody,tagButtonSave,tag311Body)
{
	try
	{
		var htmlJavaServerObject = new XMLHttpRequest();
		var strEmailFilter = /^.+@.+\..{2,3}$/;//holds the filtter for the Email
		var strPostalCodeFilter = /[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/;//holds the filtter for the Postal Code
		var strZipCodeFilter = 	/^\d{5}$|^\d{5}-\d{4}$/;//holds the filtter for the Zip Code
		var strCountry = "";//holds the Country
		var strCityValue = "";//holds the City the user has selected
		var strProvinceValue = "";//holds the Province the user has selected
		var strStreetAddressNumber = "";//holds the Address Number the user has selected
		var strStreetAddress = "";//holds the Address the user has selected
		var strPostalCode = "";//holds the Postal Code the user has selected
		var strStreetIntersection1 = "";//holds the Street Intersection 1
		var strStreetIntersection2 = "";//holds the Street Intersection 2
		var boolIsIntersection = false;//holds if the user is going to be using the Intersection
		var strLongitude = tagLocatoinLat.innerHTML;//holds the current location of the user if they are using GPS
		var strLatitude = tagLocatoinLng.innerHTML;//holds the current location of the user if they are using GPS
		
		//holds the Database Photo/Video Location
		var strThumbPhoto = tagThumbPhoto.src;
		var strPhoto1 = tagPhoto1.src;
		var strPhoto2 = tagPhoto2.src;
		var strPhoto3 = tagPhoto3.src;
		var strPhoto4 = tagPhoto4.src;
		var strPhoto5 = tagPhoto5.src;
		var strVideo = tagVideo.src;
		
		//holds the Database Streeet Type or Direction
		var strAddrStreeType = "";			
		var	strAddrDirection = "";
		var strIntersection1StreeType = "";			
		var strIntersection1Direction = "";
		var strIntersection2StreeType = "";			
		var strIntersection2Direction = "";
		
		//turns off the Save button in order for the user not to use it
		tagButtonSave.style.display = 'none';
		
		//sets the intFileSent to zero in order to tell how much data the user is downloading
		window.localStorage.setItem("intFileSent","0");
		
		var arrAddress = tagFullAddress.innerHTML.split(",");//holds each item of an Address that google brought back from its search
		
		//checks if the Address is being used or the Intersection
		if(arrAddress[0].indexOf(" & ") > -1 || arrAddress[0].indexOf(" &amp; ") > -1 || arrAddress[0].indexOf(" and ") > -1)
		{
			//finds which and is being used &, &amp;, or and 
			var strAND = "&amp;";
			
			//checks if the And is & or and
			if(arrAddress[0].indexOf(" & ") > -1)
				strAND = "&";
			else if(arrAddress[0].indexOf(" and ") > -1)
				strAND = "and";
			
			//sets the Instersection that there is a Intersection
			boolIsIntersection = true;
			
			//gets the Intersection 1 and the 2 Intersection
			strStreetIntersection1 = arrAddress[0].substring(0, arrAddress[0].indexOf(" " + strAND + " "));
			strStreetIntersection2 = arrAddress[0].substring(arrAddress[0].indexOf(" " + strAND + " ") + (strAND.length + 2),arrAddress[0].length);
		}//end of if
		else
		{
			//get the Address Number and actully address
			strStreetAddressNumber = arrAddress[0].substring(0, arrAddress[0].indexOf(" "));
			strStreetAddress = arrAddress[0].substring(arrAddress[0].indexOf(" ") + 1,arrAddress[0].length);
		}//end of else
		
		//trims the spaces around the Postal Code and Province
		arrAddress[2] = arrAddress[2].trim();

		//checks if the city is a suburbs of toronto and if so then defaults to Toronto
		switch(arrAddress[1].trim())
		{
			case "Scarborough":
			case "North York":
			case "Etobicoke":
			case "York":
			case "East York":
				strCityValue = "Toronto";
			break;
			default:
				strCityValue = arrAddress[1].trim();
			break;
		}//end of switch
		
		//checks if the Postal Code is current from google as sometimes it does not 
		//provide a current format
		if(arrAddress[2].substring(arrAddress[2].indexOf(" ") + 1,arrAddress[2].length).length == 7)
			strPostalCode = arrAddress[2].substring(arrAddress[2].indexOf(" ") + 1,arrAddress[2].length);
						
		//gets the Province and Country
		strProvinceValue = arrAddress[2].substring(0, arrAddress[2].indexOf(" ")).trim(); 
		strCountry = arrAddress[3].trim();
		
		//checks if the strStreetAddressNumber has a - mean it is an aptment 
		//however only number can be display and should be remove
		if(strStreetAddressNumber.indexOf("-") > -1)
			strStreetAddressNumber = strStreetAddressNumber.substring(strStreetAddressNumber.indexOf("-") + 1, strStreetAddressNumber.length);
	
		//checks if the Postal Code Format is current
		if (strPostalCode != "" && strCountry == "Canada" && strPostalCodeFilter.test(strPostalCode) == false)
			throw new Error("The postal code format is not valid");
		else if (strPostalCode != "" && strCountry == "USA" && strZipCodeFilter.test(strPostalCode) == false)
			throw new Error("The zip code format is not valid");

		//checks if there is a Title
		if (tagName.value == "")
			throw new Error("Please make sure to enter your title.");
			
		//checks if there is a Assignment
		if (getSelectOption(ddlAssignment) == "0")
			throw new Error("Please make sure to enter an type of problem.");
			
		//checks if there is a 311 required fields if so then check if it has been filed
		
		var arr311TextboxesFields = tag311Body.getElementsByTagName('input');//holds all 311 Textboxes
		var arr311TextareaFields = tag311Body.getElementsByTagName('textarea');//holds all 311 Textarea
		var arr311SelectFields = tag311Body.getElementsByTagName('select');//holds all 311 Select
		var arr311LabelsFields = tag311Body.getElementsByTagName('label');//holds all 311 Labels
		var str311SelectedFields = "";//holds all of the selected values
		var str311InputFields = "";//holds all of the Input values
		
		//goes around for each 311 field textboxes
		for(var intIndex = 0; intIndex < arr311TextboxesFields.length; intIndex++) 
		{
			//checks if there is a textboxes
			if(arr311TextboxesFields[intIndex] != null)
			{
				//checks to see if it is a requirend field
				if(arr311TextboxesFields[intIndex].id.indexOf("Required311") > 0)
				{
					//checks if there is a value if not then tell the user if so then add it to str311Fields 
					if (arr311TextboxesFields[intIndex].value == "")
						throw new Error("Please make sure to enter text for 311 fields.");
				}//end of if
				
				//checks if it is not the Terms of Agreement
				if(arr311TextboxesFields[intIndex].id != "chk311AgreeTerms")
					str311InputFields += arr311TextboxesFields[intIndex].value + "T!";
			}//end of if
		}//end of for loop
		
		//goes around for each 311 field textarea
		for(var intIndex = 0; intIndex < arr311TextareaFields.length; intIndex++) 
		{
			//checks if there is a textarea
			if(arr311TextareaFields[intIndex] != null)
			{
				//checks to see if it is a requirend field
				if(arr311TextareaFields[intIndex].id.indexOf("Required311") > 0)
				{
					if (arr311TextareaFields[intIndex].value == "")
						throw new Error("Please make sure to enter text for 311 fields.");
				}//end of if

				//checks if it is not the Terms of Agreement
				if(arr311TextareaFields[intIndex].id != "txt311Agree")
					str311InputFields += arr311TextareaFields[intIndex].value + "T!";
			}//end of if
		}//end of for loop
		
		//goes around for each 311 field select
		for(var intIndex = 0; intIndex < arr311SelectFields.length; intIndex++) 
		{	
			//checks if there is a select
			if(arr311SelectFields[intIndex] != null)
			{
				//checks to see if it is a requirend field
				if(arr311SelectFields[intIndex].id.indexOf("Required311") > 0)
				{
					//checks if there is a Assignment
					if (getSelectOption(arr311SelectFields[intIndex]) == "")
						throw new Error("Please make sure to enter a selection for all 311 fields.");
				}//end of if
				
				str311SelectedFields += arr311SelectFields[intIndex].value + "S!";
			}//end of if
		}//end of for loop

		//checks if there is a Agree of Terms
		if (getDocID('chk311AgreeTerms') != null && getDocID('chk311AgreeTerms').checked == false)
			throw new Error("Please agree to Terms of Use for 311");
			
		//checks if there is a Agree of Terms
		if (tagAgreeTerms.checked == false)
			throw new Error("Please agree to Terms of Use");
			
		//Abort any currently active request.
		htmlJavaServerObject.abort();
		
		//prepers the form for sending
		preSendEMail(tagMessage);
		
		//Makes a request - Gets function is need get the data from remote site
		htmlJavaServerObject.open("Post", strFileName, true);
		htmlJavaServerObject.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	
		htmlJavaServerObject.onreadystatechange = function(){
			if(htmlJavaServerObject.readyState == 4 && htmlJavaServerObject.status == 200)
			{
				try
				{
					var arrActullyEndMassage = htmlJavaServerObject.responseText.split("</head>");//gets the acrtully end message because ASP.NET has alot of useless overhead
					
					console.log("Submit Message from the Server: " + htmlJavaServerObject.responseText);
					
					//checks if there is a message from the server
					if(arrActullyEndMassage.length >= 2)
					{
						var strResponseFromServer = arrActullyEndMassage[1].trim();//holds the message from the Server
						
						console.log("Submit Message Issue Number: " + strResponseFromServer + ", Is Number: " + isNaN(strResponseFromServer) + ", Change to Int: " + parseInt(strResponseFromServer));
																			
						//checks if the user enter the corrent login and if so then go to the next page
						if(isNaN(strResponseFromServer) == false && parseInt(strResponseFromServer) > 0)
						{							
							//uploads the files to the server
					
							var boolIsDownloading = false;//holds if the phone is currently downloading an image

							//checks if the Thumb Photo has an image to upload
							if (tagThumbPhoto.src != "")
							{			
								//uploads the image and gets the upload image name
								uploadFile(tagThumbPhoto,strResponseFromServer,410);
								uploadFile(tagThumbPhoto,strResponseFromServer,120);
								boolIsDownloading = true;
							}//end of if
						
							//checks if the Photo 1 has an image to upload
							if (tagPhoto1.src != "")
							{
								//uploads the image and gets the upload image name
								uploadFile(tagPhoto1,strResponseFromServer,410);
								boolIsDownloading = true;
							}//end of if
							
							//checks if the Photo 2 has an image to upload
							if (tagPhoto2.src != "")
							{
								//uploads the image and gets the upload image name
								uploadFile(tagPhoto2,strResponseFromServer,410);
								boolIsDownloading = true;
							}//end of if
							
							//checks if the Photo 3 has an image to upload
							if (tagPhoto3.src != "")
							{
								//uploads the image and gets the upload image name
								uploadFile(tagPhoto3,strResponseFromServer,410);
								boolIsDownloading = true;
							}//end of if
		
							//checks if the Photo 4 has an image to upload
							if (tagPhoto4.src != "")
							{
								//uploads the image and gets the upload image name
								uploadFile(tagPhoto4,strResponseFromServer,410);
								boolIsDownloading = true;
							}//end of if
							
							//checks if the Photo 5 has an image to upload
							if (tagPhoto5.src != "")
							{
								//uploads the image and gets the upload image name
								uploadFile(tagPhoto5,strResponseFromServer,410);
								boolIsDownloading = true;
							}//end of if
							
							//checks if the video has an video to upload
							if (tagVideo.src != "")
							{
								//uploads the image and gets the upload image name
								uploadFile(tagVideo,strResponseFromServer,410);
								boolIsDownloading = true;
							}//end of if
					
							//checks if the downloading is being used
							if(boolIsDownloading == false)
								///tells the user thank you and allows them to submit another issue
								tagBody.innerHTML = strSubmitThankYou;
						}//end of if
						else if(strResponseFromServer == "Address Not Valid")
						{
							//check which street option the user is using Address or Intersection
							//to cusstom the error message
							if (boolIsIntersection == false)
								throw new Error("Unable to find location, check the spelling of the address. Some street use directions in there names use those directions if the app is still unable to find your intersections");
							else
								throw new Error("Unable to find location, check the spelling of the names of the intersections. Some street use directions in there names use those directions if the app is still unable to find your intersections");
						}//end of if
						else
							//tells the user that the Login has failured
							throw new Error(strResponseFromServer);
					}//end for if
					else
						//tells the user that there is an error with the Server
						throw new Error("Unable to get register to the site");
				
					//removes the value from strGPSPositionLatitude / strGPSPositionLongitude as it is not need anymore
					window.localStorage.removeItem("strGPSPositionLatitude");
					window.localStorage.removeItem("strGPSPositionLongitude");
				}//end of try
				catch(ex)
				{
					//tells the user that there is an error with the Server
					displayMessage(tagMessage,ex.name + ": " + ex.message,true,true);
					tagButtonSave.style.display = 'block';
				}//end of catch
			}//end of if
			else if(htmlJavaServerObject.readyState == 2 && htmlJavaServerObject.status == 500)
			{
				//closes the pop up and removes the textbox so the user cannot use them again until they refresh the page
				endMessage('<head></head>Unable to Connect to the Server.</head>',tagMessage);
				tagButtonSave.style.display = 'block';
			}//end of else if
		}//end of function()

		htmlJavaServerObject.send("strStreetAddressNumber=" + encodeURL(encryptRSA(strStreetAddressNumber)) + "&strStreetAddress=" + encodeURL(encryptRSA(strStreetAddress)) + "&strStreetIntersection1=" + encodeURL(encryptRSA(strStreetIntersection1)) + "&strStreetIntersection2=" + encodeURL(encryptRSA(strStreetIntersection2)) + "&strName=" + encodeURL(encryptRSA(tagName.value)) + "&strAssignment=" + encodeURL(encryptRSA(getSelectOption(ddlAssignment))) + "&strDescription=" + encodeURL(encryptRSA(tagDescription.value)) + "&boolAnonymous=" + encryptRSA(tagAnonymous.checked) + "&strCity=" + encodeURL(encryptRSA(strCityValue)) + "&strProvince=" + encodeURL(encryptRSA(strProvinceValue)) + "&strPostalCode=" + encodeURL(encryptRSA(strPostalCode)) + "&strIssueTags=" + encodeURL(encryptRSA(tagIssueTags.value)) + "&boolIsIntersection=" + encryptRSA(boolIsIntersection) + "&intUser=" + encodeURL(encryptRSA(window.localStorage.getItem("intUserID"))) + "&strThumbPhoto=" + encodeURL(encryptRSA(strThumbPhoto)) + "&strPhoto1=" + encodeURL(encryptRSA(strPhoto1)) + "&strPhoto2=" + encodeURL(encryptRSA(strPhoto2)) + "&strPhoto3=" + encodeURL(encryptRSA(strPhoto3)) + "&strPhoto4=" + encodeURL(encryptRSA(strPhoto4)) + "&strPhoto5=" + encodeURL(encryptRSA(strPhoto5)) + "&strVideo=" + encodeURL(encryptRSA(strVideo)) + "&strLongitude=" + encodeURL(encryptRSA(strLongitude)) + "&strLatitude=" + encodeURL(encryptRSA(strLatitude)) + "&strCountry=" + encodeURL(encryptRSA(strCountry)) + "&str311InputFields=" + encodeURL(encryptRSA(str311InputFields)) + "&str311SelectedFields=" + encodeURL(encryptRSA(str311SelectedFields)));

		return true;
	}//end of try
	catch(ex)
	{
		//tells the user that there is an error with the Server
		displayMessage(tagMessage,ex.name + ": " + ex.message,true,true);
		tagButtonSave.style.display = 'block';
	}//end of catch
}//end of sendSubmit()

//shoes and hides a <div> using display:block/none from the CSS
function toggleLayer(tagLayer,tagGrayOut,tagMedia)
{
	var tagStyle = '';//holds the style of tagLayer

	//gets the tagLayer and tagGrayOut Properties
	tagStyle = getDocID(tagLayer);
	tagGrayOut = getDocID(tagGrayOut);
	tagMedia = getDocID(tagMedia);
		
	if (tagStyle != null)
	{tagStyle.style.display = tagStyle.style.display? "":"block";}
	
	if (tagGrayOut != null)
	{
		tagGrayOut.style.display = tagGrayOut.style.display? "":"block";

		//for IE
		if (navigator.userAgent.indexOf('MSIE') != -1)
		{
			tagGrayOut.attachEvent('onclick',function () {
				toggleLayer(tagStyle.id,tagGrayOut.id)
								
				//checks if there is any Media to stop also pleace remove when REUSING THIS FUNCTION 
				if (tagMedia != null && document.getElementById("embed_url") != null)
					tagMedia.removeChild(document.getElementById("embed_url"));
					//tagMedia.src = "";
					//exit_youtube();
			});
		}//end of if
		//for the other browsers
		else
		{
			tagGrayOut.addEventListener('click',function () {
				toggleLayer(tagStyle.id,tagGrayOut.id);
				
			if (tagMedia != null && document.getElementById("embed_url") != null)
				tagMedia.removeChild(document.getElementById("embed_url"));
			},false);
		}//end of else
	}//end of if
}//end of toggleLayer()