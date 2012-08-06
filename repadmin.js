//Global Variables to access data for sorting
var lines = new Array();
var nodeNames = new Object();

//Function used to pull the data from the xml file
function repadminParse(docName){
	//Document variable
	var xmlhttp;
	
	//Variables to keep up with each line items data
	lines = new Array(); //reset the variable each time
	var line = new Object();
	line.origSite = "";
	line.origSrv = "";
	line.destSite = "";
	line.lastFail = "";
	line.lastSuccess = "";
	line.status = "";
	
	//Var to pass the Date/Time the CSV was updated
	var updated = "";
	
	//Object used for sorting
	nodeNames.origSite = new Array();
	nodeNames.origSrv = new Array();
	nodeNames.destSite = new Array();
	nodeNames.destSrv = new Array();
	
	//Generate a XML request regardless of browser
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	//add an event listener for document retrieval
	xmlhttp.onreadystatechange = function()
	{
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
			//separate each row of data
			docLines = xmlhttp.responseText.split("\n");
				
			//iterate through each line
			for(i=0;i<docLines.length;i++){
				
				if(docLines[i].indexOf("INFO") >= 0){
					//remove the 4th column containing the DC= info
					first_pass = docLines[i].split("\"");
					
					//put the data back together as a string
					csvLine = first_pass[0]+first_pass[2];
					
					//separate the data
					csvContent = csvLine.split(",");
					
					
					var duplicate = "a";
					for(j=0;j<lines.length;j++){
						//check for duplicate entry
						if(lines[j].origSite == csvContent[1] && lines[j].origSrv == csvContent[2] &&
						 lines[j].destSite == csvContent[4] && lines[j].destSrv == csvContent[5]){
							duplicate = j;
						}
					}
					result = assessHealth(csvContent[9]);
						
					//if it's a duplicate only update the status and dates
					if(result !="0" && duplicate != "a"){
						//determine which error is worse 
						largerProblem = compareDate(lines[duplicate].lastSuccess,csvContent[9]);
						if(largerProblem == "1"){
							lines[duplicate].lastFail = csvContent[8];
							lines[duplicate].lastSuccess = csvContent[9];
							lines[duplicate].status = result;
						}
					} else if(duplicate == "a"){
						//only if it's not a duplicate add another item
						var line = new Object();
						line.origSite = csvContent[1];
						line.origSrv = csvContent[2];
						line.destSite = csvContent[4];
						line.destSrv = csvContent[5];
						line.lastFail = csvContent[8];
						line.lastSuccess = csvContent[9];
						line.status = result;
						lines.push(line);
							
						nodeNames.origSite.push(csvContent[1]);
						nodeNames.origSrv.push(csvContent[2]);
						nodeNames.destSite.push(csvContent[4]);
						nodeNames.destSrv.push(csvContent[5]);
					}
				
				} else if(docLines[i].indexOf("Updat") >= 0){
					document.getElementById("updated").innerHTML = docLines[i];
				}
			}
			
			//sort by Destination Server by default
			nodeSort("destSrv");
		}
	}
	
	//initiate the GET comand to retrieve the CSV
	xmlhttp.open("GET",docName,true);
	xmlhttp.send();
}

//this function is used to determine if a  
//given date is older than a number of days previous to today
//accepts dates in the "01-01-2001 01:01:01" format
function assessHealth(date_in){
	//sets the regular expression for a valid date
	var validDate = /^\d{4}[-](\d{1}|\d{2})[-](\d{1}|\d{2})\s(\d{1}|\d{2})[:](\d{1}|\d{2})[:](\d{1}|\d{2})$/
	
	//Determine health using last success date
	if(validDate.test(date_in)){
		//subtract number of days before a warning
		var warn_Date = new Date();
		warn_Date.setDate(warn_Date.getDate()-1);
		
		//subtract number of days before an error
		var err_Date = new Date();
		err_Date.setDate(err_Date.getDate()-7);
		
		//subtract number of days until tombstone
		var tomb_Date = new Date();
		tomb_Date.setDate(tomb_Date.getDate()-60);
		
		//create a new date object to compare against
		var fullDateTime = date_in.split(" ");
		l_Date = fullDateTime[0].split("-");
		l_Time = fullDateTime[1].split(":");
		
		lastUpdate = new Date();
		lastUpdate.setFullYear(l_Date[0]);
		//Month is 0-11 not 1-12
		lastUpdate.setMonth(l_Date[1]-1);
		lastUpdate.setDate(l_Date[2]);
		lastUpdate.setHours(l_Time[0]);
		lastUpdate.setMinutes(l_Time[1]);
		
		//compare the last update to the different severity levels
		if(lastUpdate.getTime() < tomb_Date.getTime()){
			return "3";
		} else if(lastUpdate.getTime() < err_Date.getTime()){
			return "2";
		} else if(lastUpdate.getTime() < warn_Date.getTime()){
			return "1";
		} else {
			return "0";
		}
	} else {
		return "1";
	}
}

//this function is used to compare two dates
//accepts dates in the "01-01-2001 01:01:01" format
function compareDate(date1,date2){
	//sets the regular expression for a valid date
	var validDate = /^\d{4}[-](\d{1}|\d{2})[-](\d{1}|\d{2})\s(\d{1}|\d{2})[:](\d{1}|\d{2})[:](\d{1}|\d{2})$/
		
	//Determine if both dates are valid
	if(validDate.test(date1) && validDate.test(date2)){
		var firstDateTime = date1.split(" ");
		first_Date = firstDateTime[0].split("-");
		first_Date = firstDateTime[1].split(":");
		var firstDate = new Date();
		firstDate.setFullYear(first_Date[0]);
		firstDate.setMonth(first_Date[1]-1);
		firstDate.setDate(first_Date[2]);
		firstDate.setHours(first_Time[0]);
		firstDate.setMinutes(first_Time[1]);
		
		var secDateTime = date2.split(" ");
		sec_Date = secDateTime[0].split("-");
		sec_Time = secDateTime[1].split(":");
		var secDate = new Date();
		secDate.setFullYear(sec_Date[0]);
		secDate.setMonth(sec_Date[1]-1);
		secDate.setDate(sec_Date[2]);
		secDate.setHours(sec_Time[0]);
		secDate.setMinutes(sec_Time[1]);
		
		//compare the last update to the current date and time
		if(firstDate.getTime() < secDate.getTime()){
			return "0";
		} else {
			return "1";
		}
	} else {
		return "0";
	}
}

//this function sorts and renders the data to the screen
//accepts "origSrv","destSrv"
function nodeSort(sortBy){
	//variables used to add the document elements
	var expandedHeaders = "<tr><th>Originating Site</th>"+
		"<th onclick=\"nodeSort('origSrv')\">Originating Server</th>"+
		"<th>Destination Site</th><th onclick=\"nodeSort('destSrv')\">"+
		"Destination Server</th><th>Last Failure</th><th>Last Success</th>"+
		"<th>Status</th></tr>";
	var standardHeaders = "<tr><th onclick=\"nodeSort('destSrv')\">"+
		"Destination Server</th><th>Status</th></tr>";
	var tombstone = "<table><caption><h2>Tombstone</h2></caption>"+expandedHeaders;
	var problems = "<table><caption><h2>Replication > 7 days</h2></caption>"+expandedHeaders;
	var warnings = "<table><caption><h2>Replication > 24 hrs</h2></caption>"+expandedHeaders;
	var good = "<table><caption><h2>Replication Normal</h2></caption>"+expandedHeaders;
	var condensedTombstone = "<table><caption><h2>Tombstone</h2></caption>"+
		"<tr><th onclick=\"nodeSort('origSrv')\">Originating Server</th>"+
		"<th>Status</th></tr>";
	var condensedProblems = "<table><caption><h2>Replication > 7 days</h2></caption>"+standardHeaders;
	var condensedWarnings = "<table><caption><h2>Replication > 24 hrs</h2></caption>"+standardHeaders;
	var condensedGood = "<table><caption><h2>Replication Good</h2></caption>"+standardHeaders;
	
	//Copy lines
	var unusedLines = new Array();
	for(i=0;i<lines.length;i++){
		var line = new Object();
		line.origSite = lines[i].origSite;
		line.origSrv = lines[i].origSrv;
		line.destSite = lines[i].destSite;
		line.destSrv = lines[i].destSrv;
		line.lastFail = lines[i].lastFail;
		line.lastSuccess = lines[i].lastSuccess;
		line.status = lines[i].status;
		unusedLines.push(line);
	}
	
	//determines how to sort the data
	if(sortBy == "origSrv"){
		order = nodeNames.origSrv.sort();
		//iterate through the ordered nodes
		for(i=0;i<order.length;i++){
			//iterate through the valid lines of nodes
			for(j=0;j<unusedLines.length;j++){
				//check if the node matches the ordered node
				if(unusedLines[j].origSrv == order[i]){
					//check status to put it in the correct table
					if(unusedLines[j].status == "0"){
						good+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='goodNode'></td></tr>";
						condensedGood+="<tr><td>"+unusedLines[j].destSrv+"</td><td class='goodNode'></td></tr>";
					} else if(unusedLines[j].status == "1"){
						warnings+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='warnNode'></td></tr>";
						condensedWarnings+="<tr><td>"+unusedLines[j].destSrv+"</td><td class='warnNode'></td></tr>";
					} else if(unusedLines[j].status == "2"){
						problems+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='errNode'></td></tr>";
						condensedProblems+="<tr><td>"+unusedLines[j].destSrv+"</td><td class='errNode'></td></tr>";
					} else if(unusedLines[j].status == "3"){
						tombstone+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='tombNode'></td></tr>";
						condensedTombstone+="<tr><td>"+unusedLines[j].origSrv+"</td><td class='tombNode'></td></tr>";
					}
					unusedLines.splice(j,1);
				}
			}
		}
	} else {
		order = nodeNames.destSrv.sort();
		//iterate through the ordered nodes
		for(i=0;i<order.length;i++){
			//iterate through the valid lines of nodes
			for(j=0;j<unusedLines.length;j++){
				//check if the node matches the ordered node
				if(unusedLines[j].destSrv == order[i]){
					//check status to put it in the correct table
					if(unusedLines[j].status == "0"){
						good+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='goodNode'></td></tr>";
						condensedGood+="<tr><td>"+unusedLines[j].destSrv+"</td><td class='goodNode'></td></tr>";
					} else if(unusedLines[j].status == "1"){
						warnings+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='warnNode'></td></tr>";
						condensedWarnings+="<tr><td>"+unusedLines[j].destSrv+"</td><td class='warnNode'></td></tr>";
					} else if(unusedLines[j].status == "2"){
						problems+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='errNode'></td></tr>";
						condensedProblems+="<tr><td>"+unusedLines[j].destSrv+"</td><td class='errNode'></td></tr>";
					} else if(unusedLines[j].status == "3"){
						tombstone+="<tr><td>"+unusedLines[j].origSite+"</td><td>"+unusedLines[j].origSrv+"</td>"+
							"<td>"+unusedLines[j].destSite+"</td><td>"+unusedLines[j].destSrv+"</td>"+
							"<td>"+unusedLines[j].lastFail+"</td><td>"+unusedLines[j].lastSuccess+"</td>"+
							"<td class='tombNode'></td></tr>";
						condensedTombstone+="<tr><td>"+unusedLines[j].origSrv+"</td><td class='tombNode'></td></tr>";
					}
					unusedLines.splice(j,1);
				}
			}
		}
	}
	
	//complete the tables
	good+="</table>";
	warnings+="</table>";
	problems+="</table>";
	tombstone+="</table>";
	
	//clear the current contents
	document.getElementById("standardView").innerHTML = "";
	document.getElementById("expandedView").innerHTML = "";
	
	//verify something is in the table before adding the table
	if(tombstone.indexOf("<td>") >= 0){
		document.getElementById("standardView").innerHTML += condensedTombstone;
		document.getElementById("expandedView").innerHTML += tombstone;
	}
	if(problems.indexOf("<td>") >= 0){
		document.getElementById("standardView").innerHTML += condensedProblems;
		document.getElementById("expandedView").innerHTML += problems;
	}
	if(warnings.indexOf("<td>") >= 0){
		document.getElementById("standardView").innerHTML += condensedWarnings;
		document.getElementById("expandedView").innerHTML += warnings;
	}
	if(good.indexOf("<td>") >= 0){
		document.getElementById("standardView").innerHTML += condensedGood;
		document.getElementById("expandedView").innerHTML += good;
	}
}