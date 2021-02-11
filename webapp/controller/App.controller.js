sap.ui.require(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/base/Log",
    "demo/ui5/TodModApp/controller/formatter",
    "demo/ui5/TodModApp/controller/utility",
    "demo/ui5/TodModApp/controller/devSettings",
  ],
  function (Controller, JSONModel, MessageToast, Log, formatter, utility, devSettings) {
    "use strict";

    var appController = Controller.extend("demo.ui5.TodModApp.controller.App", {

      formatter: formatter,
      utility: utility,//can include like this
      devSettings: devSettings,

      onInit: function () {

        //Set the Applicaion Mode here- can be debug Mode on or Off!
        this._devSettings = new this.devSettings();
        this._currentView = this.getView();

        if (this._devSettings.debugMode) {
          debugger;
          Log.info("-->APP Controller -onINIT() is called");
        }
        //create a Model to be accessed by this object! 
        this._oModel = new JSONModel({
          templates: [],
          business_areas: [],
          users: [],
          instructions: [],
          tickets: [],
          logs: []
        });

        //set the model to the whole Page! 
        this._currentView.setModel(this._oModel);

        let currentBundle = this._currentView.getModel("i18n").getResourceBundle();
        //let text = currentBundle.getText("searchPageTitle", []);

        //let templatesModel = new JSONModel(sap.ui.require.toUrl("demo/ui5/TodModApp/model/templates.json"));
        //this._oModel.setProperty("/templates", templatesModel.getData());


        // load the models-from the Mock Json model at the models folder
        this.asyncLoadMockData("./model/templates.json", (data)=> {
          this._oModel.setProperty("/templates", data);
        }
        );
        this.asyncLoadMockData("./model/business_areas.json",  (data)=> {
          this._oModel.setProperty("/business_areas", data);
        }
        );

        this.asyncLoadMockData("./model/users.json", (data)=> {
          this._oModel.setProperty("/users", data);
        }
        );

        this.asyncLoadMockData("./model/instructions.json", (data)=> {
          this._oModel.setProperty("/instructions", data);
        }
        );

        this.asyncLoadMockData("./model/logs.json",  (data)=> {
          this._oModel.setProperty("/logs", data);
        }
        );

      
        const serviceNowURL = "https://cors-anywhere.herokuapp.com/https://dev64357.service-now.com/api/now/table/ticket";

        //fetch the Tickets from the external source-ServiceNow! 
        this.asyncFetchTicketsFromServiceNowAPI(serviceNowURL, (data)=> {
          this._oModel.setProperty("/tickets", data);
        });
      },

      // use async function to call getAPIData promise function
      asyncLoadMockData: async function (url, callback) {
        try {
          console.log('inside the asynch await');
          // call promise to get data
          var response = await fetch(url);
          // convert to json format
          var data = await response.json();
          // update model data
          callback(data);
        } catch (err) {
          console.log(err);
          MessageToast.show(err.message);
        }
      },
      asyncFetchTicketsFromServiceNowAPI: async function (URL,callback) {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Basic YWRtaW46WjR0Y1BsVFBwUXY1");

        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };

        try {
          console.log('inside the asynch await');
          // call promise to get data
          var response = await fetch(URL, requestOptions);
          // convert to json format
          var data = await response.json();
          //result is at the result  
          var result = data.result;
           callback(result);  
        } catch (err) {
          console.log(err);
          MessageToast.show(err.message);

        }
      },
      onBeforeRendering: function () {
        if (this._devSettings)
          Log.info("APP on BEFORE RENDERING is called");

      },

      onAfterRendering: function () {
        if (this._devSettings)
          Log.info("APP afterRendering is called");
      },

      onExit: function () {
        if (this._devSettings)
          Log.info("APP on EXIT is called");
      },
      parseDate: function () {
        jQuery.sap.require("sap.ui.core.format.DateFormat");
        var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "YYYY/MM/DD" });
        var dateFormatted = dateFormat.format(new Date());
        console.log(`Formatted date is ${dateFormatted}`);

      }
    });
    return appController;
  }
);
