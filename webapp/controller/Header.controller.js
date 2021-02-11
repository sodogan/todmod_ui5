sap.ui.require([
    "sap/ui/core/mvc/Controller",
    'sap/ui/Device',
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "demo/ui5/TodModApp/controller/formatter"
], function (Controller, Device, UIComponent, Fragment, Log, JSONModel, MessageToast, Sorter, Filter, FilterOperator, GroupHeaderListItem, formatter) {
    "use strict";

    return Controller.extend("demo.ui5.TodModApp.controller.Header",
        {

            formatter: formatter,

            onInit: function () {
                const oGridListModList_ID = 'oGridListModList';
                const oGridListTodList_ID = 'oGridListTodList';
                const oGridListMimList_ID = 'oGridListMimList';
            
                console.log('INIT at Header Controller');
            
                //get the App controller and the view as its the parent control
                const parentControl = this.getOwnerComponent().getAggregation("rootControl");
                const appController = parentControl.getController();
                const appView = appController.getView();
            
                //set here
                this._parentController = appController; 
                this._parentView = appView; 
                this._debugMode = this._parentController._devSettings.debugMode;

                if (this._debugMode) {
                    debugger;
                    Log.info("-->HEADER Controller -onINIT() is called");

                }

                //Promise to parse users based on either mod,tod,mim
                //get all the users-can be a promise!
                this._allUsers = this._parentView.getModel().getData().users;

                this._modGridList = this.byId(oGridListModList_ID);
                this._todGridList = this.byId(oGridListTodList_ID);
                this._mimGridList = this.byId(oGridListMimList_ID);

                var thisRef = this;


                //Create JsonModel for tods and set the data
                this.createModelForTodsModsMims('tods', oGridListTodList_ID, thisRef)
                    .then((model) => {
                        console.log(model);
                        var todsFiltered = thisRef._allUsers.filter((obj) => obj.role == 'tod');
                        model.setProperty('/tods', todsFiltered);
                    })
                    .catch((err) => {
                        console.log(err.message);
                        MessageToast.show(err.message);
                    })
                    .finally();

                //Create JsonModel for mods and set the data
                this.createModelForTodsModsMims('mods', oGridListModList_ID, thisRef)
                    .then((model) => {
                        console.log(model);
                        var todsFiltered = thisRef._allUsers.filter((obj) => obj.role == 'mod');
                        model.setProperty('/mods', todsFiltered);
                    })
                    .catch((err) => {
                        console.log(err.message);
                        MessageToast.show(err.message);
                    })
                    .finally();


                //Create JsonModel for Mims and set the data
                this.createModelForTodsModsMims('mims', oGridListMimList_ID, thisRef)
                    .then((model) => {
                        console.log(model);
                        var mimsFiltered = thisRef._allUsers.filter((obj) => obj.role == 'mim');
                        model.setProperty('/mims', mimsFiltered);
                    })
                    .catch((err) => {
                        console.log(err.message);
                        MessageToast.show(err.message);
                    })
                    .finally();

    
                // The header at the top for current date and calender week-Not needed now!
                const oObjectHeaderMain_ID = 'oObjectHeaderMain';
                var bIsPhone = Device.system.phone;
                let sdcLogo = sap.ui.require.toUrl("demo/ui5/TodModApp/media/sdc_logo.jpg");

                let oPanelSearch = this.byId('oPanelSearch');
                if (oPanelSearch) {
                    oPanelSearch.addStyleClass('myGoldenStyle');
                }

                //create Json model for the Logo
                let oHeaderViewModel = new JSONModel({
                    sdcLogo: sdcLogo,
                    imageWidth: bIsPhone ? "5em" : "15em",
                    imageHeight: bIsPhone ? "2em" : "2em",
                    dates: {
                        currentDate: new Date(),
                        currentCalenderWeek: this.formatter.getCalenderWeek()
                    }

                });

                let objectHeaderControl = this.byId(oObjectHeaderMain_ID);
                
                //set the Logo to the View itself
                if (objectHeaderControl) {
                    objectHeaderControl.setModel(oHeaderViewModel);
                }
                

            },
            onBeforeRendering: function () {
                console.log("Header  on BEFORE RENDERING is called");
                //var a = $('#__xmlview0--oBtnPrimary-__xmlview0--oGridListMimList-0-inner');
                //a.addClass('sapMBtnPhonePrimary')

            },

            onAfterRendering: function () {
                console.log("Header afterRendering is called");

            },
            onSelectIconBar: function () {
                // var j = this.byId('oBtnPrimary');
                //j.addStyleClass('sapMBtnPhonePrimary');
                //$('.sapMBtnTransparent').addClass('sapMBtnPhonePrimary');
                $('#__xmlview0--oBtnPrimary-__xmlview0--oGridListMimList-0-BDI-content').addClass('sapMBtnPhonePrimary');
                $('#__xmlview0--oBtnSecondary-__xmlview0--oGridListMimList-0-BDI-content').addClass('sapMBtnPhoneSecondary');
            },
            createModelForTodsModsMims: function (roleType, gridListID, thisRef) {
                let promise = new Promise(function (resolve, reject) {
                    //json model for mods
                    let modelObj = {};
                    modelObj[roleType] = [];
                    /* creates dynamic type like :
                    let modListJsonModel = new JSONModel({
                    mods: []
                   });
                   //json model for tods
                  let todListJsonModel = new JSONModel({
                    tods: []
                 });
                    */
                    let jsonModel = new JSONModel(modelObj);
                    let gridList = thisRef.byId(gridListID);
                    if (gridList) {
                        gridList.setModel(jsonModel);
                        resolve(jsonModel);
                    }
                    else {
                        reject(new Error('Json Model creation failed'));
                    }
                });
                return promise;
            },

            onSelectTemplatesModules: function (oEvent) {
                let selectedTemplates = oEvent.getSource().getSelectedItems();
                let allSelectedTemplateKeys = selectedTemplates.map((obj) => obj.mProperties.key);


                let comboModulesControl = this.byId('oMultiComboModules');
                let all_modules = this.getView().getModel().getProperty('/business_areas');


                //if user selects template
                if (allSelectedTemplateKeys.length > 0) {
                    //filter the matching modules based on the templates selected
                    let matchingModules = all_modules.filter((item) => {
                        if (allSelectedTemplateKeys.indexOf(item.templateID) !== -1)
                            return true;
                    });
                    /*                        
                    var oItemTemplate = new sap.ui.core.ListItem({text:"{name}"});
                    var oComboBox = new sap.m.ComboBox({
                        items: {
                            path: "/business_areas", 
                            template: oItemTemplate
                        }
                    });
                    */
                    // comboModulesControl.getModel().setData(matchingModules);
                    // comboModulesControl.getModel().refresh();
                    comboModulesControl.getModel().setProperty('/modules', matchingModules);
                }
                else {
                    comboModulesControl.getModel().setProperty('/modules', all_modules);
                }

            },

            onSearchTodList: function (oEvent) {

                debugger;
                let comboTemplatesControl = this.byId('oMultiComboTemplates');
                let comboModulesControl = this.byId('oMultiComboModules');

                //make sure that the user selects both the template and the module


                let selectedTemplates = comboTemplatesControl.getSelectedItems();
                let selectedModules = comboModulesControl.getSelectedItems();

                 if (!selectedTemplates.length) {
                      //set the value state to Error
                      comboTemplatesControl.setValueState(sap.ui.core.ValueState.Error);
                      MessageToast.show('Please select a valid template');
                      $(".sapMMessageToast").addClass("sapMMessageToastSuccess ");
                      return;
                  }
                  else {
                      comboTemplatesControl.setValueState(sap.ui.core.ValueState.Information);
                  } 
                let selectedTemplateKeys = selectedTemplates.map((item) => item.getKey());
                let selectedModuleKeys = selectedModules.map((item) => item.getKey());

                //get the binding
                let gridList = this.getView().byId('oGridListTodList');

                //enable to visible
                //gridList.getVisible() ==false ? gridList.setVisible(true):gridList.setVisible(true) ;

                let oListBinding = gridList.getBinding('items');

                let templateSearchFilter = [], moduleSearchFilter = [];

                // add new filter to array
                // filter on field 'Name', with 'contains' operation, for search value 'sQuery'
                if (selectedTemplateKeys.length) {
                    for (let selectedKey of selectedTemplateKeys)
                        templateSearchFilter.push(new Filter("templateID", FilterOperator.EQ, selectedKey));
                }
                else {
                    templateSearchFilter.push(new Filter("templateID", FilterOperator.Contains, '-'));
                }

                if (selectedModuleKeys.length) {
                    // add new filter to array
                    // filter on field 'Name', with 'contains' operation, for search value 'sQuery'
                    for (let selectedKey of selectedModuleKeys)
                        moduleSearchFilter.push(new Filter("businessAreaID", FilterOperator.EQ, selectedKey));
                }
                else {
                    moduleSearchFilter.push(new Filter("businessAreaID", FilterOperator.Contains, '-'));
                }
                //template search filter
                console.log(...templateSearchFilter);
                //module search filter
                console.log(...moduleSearchFilter);

                var result = oListBinding.filter(
                    new Filter({ filters: templateSearchFilter, and: false }),
                    new Filter({ filters: moduleSearchFilter, and: true })
                );

                // apply filters to gridlist binding items
                //var result = oListBinding.filter(new Filter({ filters: searchFilter, and: false }));
                //if(templateSearchFilter.length)
                //oListBinding.filter(new Filter({ filters: templateSearchFilter, and: false }));
                //if(moduleSearchFilter.length)
                //oListBinding.filter(new Filter({ filters: moduleSearchFilter, and: false }));


            },
            getAllUsersPromise: function () {
                var parentControl = this.getOwnerComponent().getAggregation("rootControl");
                let mypromise = new Promise(function (resolve, reject) {
                    var parentView = appController.getView();
                    var users = parentView.getModel().getData().users;
                    if (users) {
                        resolve(users);
                    }
                    else {
                        reject(new Error('Failed to read the user data'));
                    }
                });
                return mypromise;
            },
            getGroupHeader: function (oGroup) {
                return new GroupHeaderListItem({
                    title: oGroup.key,
                    upperCase: true,
                });

            },
            onCreateTicket: function (oEvent) {
                console.log('Creating a new ticket');
                var oView = this.getView();
                // create dialog lazily if can't find the dialog by it's id
                if (!this.byId("createTicketDialog")) {
                    // load asynchronous XML fragment
                    Fragment.load({
                        id: oView.getId(),
                        name: "demo.ui5.TodModApp.view.fragments.CreateTicketDialog",
                        controller: this
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oView.addDependent(oDialog);
                        oDialog.open();
                    });
                }
                else {
                    // open dialog
                    this.byId("createTicketDialog").open();
                }
            },
            onSubmitNewTicket: function () {
                var oinputTicketRef = this.byId("inputTicketRef").getValue(),
                    oinputTemplate = this.byId("inputTemplate").getValue(),
                    oinputStatus = this.byId("inputStatus").getValue(),
                    oinputAssignedTo = this.byId("inputAssignedTo").getValue(),
                    oinputDetails = this.byId("inputDetails").getValue();

                var oNewTicketObj = {};

                oNewTicketObj.cism_ticket_ref = oinputTicketRef;
                oNewTicketObj.template = oinputTemplate;
                oNewTicketObj.status = oinputStatus;
                oNewTicketObj.assignedTo = oinputAssignedTo;
                oNewTicketObj.details = oinputDetails;

                console.log(oNewTicketObj);

                let oModel = this.getView().getModel();



                var oData = JSON.stringify(oNewTicketObj);
                var sLocalPath = './model/tickets.json';

                jQuery.ajax({
                    type: "POST",
                    contentType: "application/json",
                    data: oData,
                    url: sLocalPath,
                    dataType: "json",
                    success: function () {
                        console.log('Success');
                        // that._updateModel(sLocalPath, oObject); 
                        // that.createEntry("/");
                        // that.fireRequestCompleted();
                    },
                    error: function () {
                        console.log('Failed');

                        // that.fireRequestFailed();
                    }
                });


                /*                 oModel.create("/tickets", oNewTicketObj, {
                                    success: function (res) {
                                        MessageToast.show("New product created");
                                    },
                                    error: function (err) {
                                        MessageToast.show("Failed to create new product");
                                    }
                                }); */

                this.byId("createTicketDialog").close();


            },
            // close create product dialog
            onCancelCreateTicket: function () {
                this.byId("createTicketDialog").close();
            },
            onSortByFirstName: function (oEvent) {
                console.log('Sort button is pressed');
                let eventObj = oEvent.getSource();
                console.dir(eventObj);

                //get the view
                let view = this.getView();
                let gridList = view.byId("todList");
                if (!gridList) {
                    console.log('could not find the control');
                }
                if (gridList) {
                    let bindings = gridList.getBinding("items");
                    console.log(bindings);
                    bindings.sort(new Sorter("firstName"));
                }
            },
            onSearchTicketByIDORTemplate: function (oEvent) {
                let sQuery = oEvent.getParameter("query");
                //get the binding
                let gridList = this.getView().byId('ticketList');

                let oListBinding = gridList.getBinding('items');
                let searchFilter = [];
                if (sQuery) {
                    //searchFilter.push(new Filter(criteria, FilterOperator.Contains, sQuery));
                    searchFilter.push(new Filter("template", FilterOperator.Contains, sQuery));
                    searchFilter.push(new Filter("cism_ticket_ref", FilterOperator.Contains, sQuery));
                }
                debugger;

                // apply filters to gridlist binding items
                var result = oListBinding.filter(new Filter({ filters: searchFilter, and: false }));

            },
            addToFilter: function (criteria, sQuery, anyFilter) {
                anyFilter.push(new Filter(criteria, FilterOperator.Contains, sQuery));
                return anyFilter;
            },
            // function to handle product card press event
            onUserDetailPressed: function (oEvent) {

                console.log('Navigating to user details');
                var oView = this.getView(),
                    oSelectedItem = oEvent.getSource(),
                    sPath;

                // create dialog if can't find the dialog by it's id
                if (!this.byId("userDetailDialog")) {
                    // load asynchronous XML fragment using promise
                    Fragment.load({
                        id: oView.getId(),
                        name: "demo.ui5.TodModApp.view.fragments.UserDetailDialog",
                        controller: this
                    }).then(function (oDialog) {
                        // oDialog is the dialog instance

                        // connect dialog to this controller
                        oView.addDependent(oDialog);
                        // open the dialog
                        oDialog.open();
                    });
                } else {
                    // open the dialog directly
                    this.byId("userDetailDialog").open();
                }

                const oContext = oSelectedItem.getBindingContext();

                const selectedObect =  oContext.getObject();
                // get item binding context like: /Products/1
                let index= this._allUsers.findIndex((item)=>item.id==selectedObect.id);
                const relativePath = `/users/${index}`;
                //var sPath = oContext.getPath();
                // use element binding to bind data to the dialog
                //this.byId("userDetailDialog").bindElement({ path: relativePath, model: "/users" });
                this.byId("userDetailDialog").bindElement({ path: relativePath});
       
            },
            		// function to handle close button press event (in product dialog)
		    onCloseUserDetailDialog: function () {
			this.byId("userDetailDialog").close();
	     	},
            onNavigateToDetail: function () {
                //Need to go to the next view!
                debugger;
                var oRouter = UIComponent.getRouterFor(this);

                console.log(oRouter);
                //get the MessageToast
                let toast = sap.ui.require("sap/m/MessageToast");
                console.log(toast);
                // use route name 'detail' here
                //oRouter.navTo("detail");

                oRouter.navTo("to_detail",
                    {
                        // only parameters defined in "pattern" in manifest.json will be passed to target
                        userId: 'hello world'
                    },
                    true);

            },
            onTicketListPress: function (oEvent) {
                //here goes the code!
                let list = oEvent.getSource();
                console.log(`The type of the event source is ${list.getMetadata().getName()}`);
                debugger;

            },
            onTriggerPhoneCall: function (oEvent) {
                debugger;
                //get the button binding context
                let currentContext = oEvent.getSource().getBindingContext().getObject();
                if (currentContext)
                    sap.m.URLHelper.triggerTel(currentContext.mobileNumber);
            }

        });
});