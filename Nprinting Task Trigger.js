define( [ "qlik"
],
function ( qlik,template) {

	

	return {

	definition : {
			type : "items",
			component : "accordion",
			items: {
				settings: {
					uses: "settings",
					items: {
					MyTextbox: {
							label:"Enter Nprinting Server",
							type: "string",
							ref:"Rserver"
						},
						MyText: {
							label:"Enter Nprinting Task Id",
							type: "string",
							ref:"RTask"
						},
					MyTextB: {
							label:"Enter Button Label",
							type: "string",
							defaultValue:"Nprinting  Distribution",
							ref:"RLabel"
						},
					MyColorPicker: {
              				label:"Button Background",
              				component: "color-picker",
             				 ref: "myColor",
             				 type: "object",
             				 defaultValue: {
               					 color: "#4ca87b",
               					 index: "-1"
              					}
            		 }
						
						
					}
				}
			}
		},
		support : {
			snapshot: true,
			export: true,
			exportData : false
		},
		paint: function ($element,layout) {
		
	
			//add your rendering code here
			var r=Math.floor(Math.random()*100001);
			var ButtonLabel=layout.RLabel;
			var ButtonColor=layout.myColor.color;
			
			 var html  = '<div id ="execute-reload" style="height: 100%;position: relative" class="ng-scope"><button  id ="reload'+r+'" style="width: 100%;height: 100%;transition: transform .1s ease-in-out;position: absolute;bottom: 0;left: 0; top: 0;right: 0;margin: auto;cursor: pointer;color: #ffffff;font-weight: bold;background-color:'+layout.myColor.color+ ';border: none;" tabindex="-1"><text style="white-space: nowrap; font-family: &quot;Source Sans Pro&quot;, sans-serif; font-size: inherit; margin: 0px 3%; display: flex; align-items: center; justify-content: center;"><span style="white-space: nowrap; text-overflow: ellipsis; overflow: visible;">' +layout.RLabel +'</span></text></button></div>';
                $element.html( html );
				  
			 var timerId;
			 var counter=0;
			 var taskstatus;
			 var objid;
		     var buttonid='#reload'+r ;
			 var alerted=false;
			 var taskId= layout.RTask;
		     var servername= layout.Rserver;
			 
				function setbutton(color, text)
				{
					$(buttonid).css("background-color",color);
					$(buttonid).text(text);
				}
				  

			$(buttonid).click(function(event) {
				
				if(servername == null || servername == '')
				{
					alert('Please Enter Server Name');
				}
				else
				{
				  if (taskId == null || taskId == '')
				  {
				 	 alert('Please Enter Task Id');
				  }
				  else
				  {
				 
				   var check = confirm("Do you want to trigger Nprinting Task?");
                   if (check == true) 
				   {
				  
					  setbutton("#EB8705", 'Executing..');
					  $(buttonid).attr("disabled", true);  //Disable Button Action
					  
						$.ajax({
						type:"GET",
						url: servername +'/api/v1/login/ntlm',
						xhrFields: {
							withCredentials: true
						}
						}).then(function(data)
						{
							var obj= JSON.parse(JSON.stringify(data));
							console.log(obj);
							if(obj.code==0)
							{
								console.log('Authenticated');


			

						//task execution
						$.ajax({
							type:"POST",
							url:servername+ '/api/v1/tasks/'+taskId+'/executions',
							error:function(data)
							{
							console.log(data);
							var obj=JSON.parse(JSON.stringify(data.responseJSON.error.message));
							console.log(obj);
							alert(obj);
							$(buttonid).attr("disabled", false);  //Enable Button Action
						 	setbutton(ButtonColor, ButtonLabel);
							},
							xhrFields: {
							withCredentials: true
							}
							}).then(function(data,status)
							{

								 var obj=JSON.parse(JSON.stringify(data));
								 console.log('Task execution Id' + obj.data.id);
								 objid=obj.data.id;
									var testStaus;	
			
				
					//Monitoring Task Execution
		  timerId=setInterval(
				function getStatus()
				{
				counter++;


					$.ajax({
						type:"GET",
						url:servername+ '/api/v1/tasks/'+taskId+'/executions/'+objid,
						xhrFields: {
						withCredentials: true
						}
						}).then(function(data,status)
						{
						var obj=JSON.parse(JSON.stringify(data));
						 console.log('Task execution status' + obj.data.status);
						 taskstatus=obj.data.status;

						 if(taskstatus === 'Completed')
						 {

						 clearInterval(timerId);
						  if(alerted === false)
						  {
							alerted=true;
							alert('Report Sent');
							$(buttonid).attr("disabled", false);  //Enable Button Action
						 	setbutton(ButtonColor, ButtonLabel);
							}
						 alerted=true;
						}
						else
						{
						 if(taskstatus === 'Failed')
						 {

						 clearInterval(timerId);
						 if(alerted === false)
						  {
							alerted=true;
							alert('Report Failed');
							$(buttonid).attr("disabled", false);  //Enable Button Action
							setbutton(ButtonColor, ButtonLabel);
							}
							alerted=true;


						 }
						 }




					});
			  },200);
			 
			//alert('Report Sent');
			 
			 });
			 }
			 });
			 
			 		}
					}
					}
				
			
			 
		
});





			
			//needed for export
			return qlik.Promise.resolve();
		}
	};

} );

