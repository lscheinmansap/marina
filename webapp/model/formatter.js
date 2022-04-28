sap.ui.define([], function () {
    "use strict";
  
    return {

        modDateTime: function(val) {
            return moment(val).format('MMM DD, YYYY hh:mm:ss a')
        },

        modDateTimeStamp: function(val) {
            return moment(val).format('YYYY-MM-DD hh:mm:ss')
        },

        imgDateTimeStamp: function(val) {
            return moment(val).format('MMM DD YYYY, h:mm:ss a')
        },

        humanFileSize: function(size) {
		    var i = Math.floor( Math.log(size) / Math.log(1024) );
		    return ( size / Math.pow(1024, i) ).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
		},

        formatNumber: function(num) {
			if (num)  {
				return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
			}
			else {
				return "";
			}
		},

        modDateTimeLLLL: function(val) {
            return moment(val).format('LLLL')
        },

        modMonthsShort: function(val) {
            return moment(val).format("MMM-YY");
        },

        filesCount: function(val) {
            if (val)  {
                return val + " total";
            }
            else {
                return "No Files Available";
            }
        },

        secsToMins: function(num) {
			if (num && parseInt(num) > 60)  {
				return Math.trunc(parseInt(num)/60) + " mins";
			}
			else {
				return num + " secs";
			}
		},

        secsToMinsImagery: function(num) {
            return " secs"
		},

        searchMatches: function(val) {
            if (val > 0)  {
                return sap.ui.core.IndicationColor.Indication05;
            }
            else  {
                return; 
            }
        },

        acceptOrDecline: function(val) {
            if (val === 'N')  {
                return "sap-icon://decline";
            }
            else  {
                return "sap-icon://accept";
            }
        },

        workFlowItemState: function(actionTaken, assignedTimestamp){
            if (actionTaken)  {
                if (actionTaken !== constants.CARD_ACTION_REJECTED)  {
                    return sap.ui.core.ValueState.Success;	
                }
                else  {
                    return sap.ui.core.ValueState.Error;	
                }	
            }
            else  {
                if (assignedTimestamp)  {
                    return sap.ui.core.ValueState.Warning;	
                }
                else  {
                    return sap.ui.core.ValueState.None;	
                }	
                
            }

        },

        isSubscribed: function(val) {
            if(val) {
                return "Unsubscribe"
            } else {
                return "Subscribe"
            }
        },

        trueOrFalse: function(val) {
            if (val)  {
                return true;
            }
            else  {
                return false;
            } 
        },

        yesNoOrNothing: function(val) {
            if(val === 'Y')  {
                return 'Yes'
            }	
            else if (val === 'N')  {
                return 'No';
            }
            else {
                return "";
            }
        },

        rightToEdit: function(creationUser, currentState, actionTaken, userid, isAdmin, isApproved) {

            if (isAdmin && (currentState || isApproved) ) {
                return true;
            }
            // users can edit/delete their own cards only when the cards have not been submitted or if the card was rejected.
            else if (creationUser === userid && (currentState === 'Not Submitted' || actionTaken === 'REJECTED'))  {
                return true;
            }
            else  {
                return false;
            }
        },

        canSubmit: function(isApproved, currentState, createUser, currUser) {
            if (isApproved !== 1 && (!currentState && createUser === currUser) )  {
                return true;
            }
            else  {
                return false;
            }

        },

        isApprover: function(isApprover, currentState) {

            if (isApprover && currentState)  {
                return true;
            }
            else  {
                return false;
            }

        },

        greaterThanZero: function(val) {
            if (val > 0)  {
                return true;
            }
            else  {
                return false;
            }
        },
        
        getFileTypeIcon: function(val)  {
			if (val === 'CSV')  {
				return "sap-icon://excel-attachment";
			}
			else if (val === 'DOC')  {
				return "sap-icon://doc-attachment";
			}
			else if (val === 'TXT')  {
				return "sap-icon://attachment-text-file";
			}
			else if (val === 'JSON')  {
				return "sap-icon://syntax";
			}
			else if (val === 'XML') {
				return "sap-icon://source-code";
			}
			else  {
				return "sap-icon://document";
			}			
		},

        getVisible: function(val) {
            if (val === 'N')  {
                return false;
            }
            else  {
                return true;
            }

        },

        isCSV: function(val) {
            if (val && val.toUpperCase() === "CSV")  {
                return true;
            }
            else  {
                return false;
            }
        },

        getCardState: function(stateName, actionTaken)  {
            if (actionTaken)  {
                return actionTaken;
            }
            else  {
                return stateName; 
            }
        },

        getDatasetIcon: function(category)  {
			if (category && category.length>0)  {
				var dsCategoriesModel = this.getOwnerComponent().getModel("DATASET_CATEGORIES_MODEL");
				var categories = dsCategoriesModel.getProperty("/data");
				for (var i=0; i<categories.length; i++)  {
					if (categories[i].NAME === category)  {
						return categories[i].ICON;
					}
				}
			}
			else  {
				return "sap-icon://database";
			}
		},

        getRating: function(val) {
            val = parseInt(val);
            if (val === 0) {
                return 0;
            }
            else if (val > 0 && val <= 10)  {
                return 1;
            }
            else if (val >= 11 && val <= 20)  {
                return 2;
            }
            else if (val >= 21 && val <= 30)  {
                return 3;
            }
            else if (val >= 31 && val <= 40)  {
                return 4;
            }
            else {
                return 5;
            }
        },

        getURL: function(val) {

            if (val && val.startsWith("http") ) {
                return true;
            }
            else  {
                return false;
            }

        },

        getClassification: function(val) {
            if (val.toUpperCase() === 'UNCLASSIFIED')  {
                return sap.ui.core.ValueState.Success;
            }
            else if (val.toUpperCase() === 'CUI' || val.toUpperCase() === 'CONTROLLED UNCLASSIFIED INFORMATION')  {
                return sap.ui.core.ValueState.Information;
            }
        },

        getNumberOfFiles: function(val) {
            if (val > 0)  {
                return val.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " Files";
            }
            else {
                return "No Files";
            }

        },

        isAdmin: function(val) {
            if (val)  {
                return true;
            }
            else  {
                return false;
            }

        },

        isActionTaken: function(val) {
            if (val)  {
                return true;
            }
            else  {
                return false;
            }

        },

        isValidDataCard: function(id) {
            if (id)  {
                return true;
            }
            else  {
                return false;
            }

        },

        isClassifiedIcon: function(val) {
            if (val === 'CONTROLLED UNCLASSIFIED INFORMATION' || val === 'CUI')  {
                return "sap-icon://accept";
            }
            else  {
                return "sap-icon://decline";
            }
        },

        isClassifiedColor: function(val) {
            if (val === 'CONTROLLED UNCLASSIFIED INFORMATION' || val === 'CUI')  {
                return sap.ui.core.IconColor.Positive;
            }
            else  {
                return sap.ui.core.IconColor.Negative;
            }
        },

        infoLabelStatus: function(val) {
            
            if (val && val !== "")  {
                return val;
            }
            else  {
                return "Not Available";
            }
        },

        infoLabelColorScheme: function(val) {

            if (val)  {
                if (val.includes("Approved"))  {
                    return 8;
                }
                else if (val.includes("Submitted")) {
                    return 1;
                }
                else {
                    return 9;
                }
            }
            else  {
                return 9;
            }
        },

        isOffset: function(offset) {
            if (offset > 0)  {
                return true;
            }
            else  {
                return false;
            }
        },

        getOffsetMultiple: function(offset, total) {
            if ((parseInt(offset) + constants.RESULTS_LIMIT) >= total)  {
                return false;
            }
            else  {
                return true;
            }
        },

        getResultsPagerCount: function(total, offset, limit) {
            if (total > 0)  {
                var start = parseInt(offset)+1;
                var end = parseInt(limit)+(start-1);
    
                if (end > total)  {
                    end = total;
                }
                return start + "-" + end;
            }
            else  {
                return "No Results";
            }
        },

        isNewDataCard: function(name) {
            if (name)  {
                return name;
            }
            else  {
                return "New Data Card";
            }
        },

        isAbleToSaveOrDeleteDataCard: function(isAdmin, currentState, createUser, currUser)  {
            if (isAdmin || (!currentState && createUser === currUser) ) {
                return true;
            }
            else  {
                return false;
            }
        },

        isDataCardWithErrors: function(currentState, createUser, currUser)  {
            if (!currentState && createUser === currUser)  {
                return true;
            }
            else  {
                return false;
            }
            
        },

        getProcessFlowState: function(assignedTimestamp, actionTaken)  {
            if (actionTaken)  {
                if (actionTaken !== constants.CARD_ACTION_REJECTED)  {
                    return [{state: sap.suite.ui.commons.ProcessFlowNodeState.Positive, value: 100}];	
                }
                else  {
                    return [{state: sap.suite.ui.commons.ProcessFlowNodeState.Negative, value: 100}];	
                }	
            }
            else  {
                if (assignedTimestamp)  {
                    return [{state: sap.suite.ui.commons.ProcessFlowNodeState.Critical, value: 100}];	
                }
                else  {
                    return [{state: sap.suite.ui.commons.ProcessFlowNodeState.Planned, value: 100}];	
                }	
                
            }
        },

        getCardAction: function(actionTaken)  {
            if (actionTaken === 'Not Submitted')  {
                return sap.ui.core.ValueState.None;
            }
            else if (actionTaken === constants.CARD_ACTION_REJECTED)  {
                return sap.ui.core.ValueState.Error;
            }
            else if (actionTaken === constants.CARD_ACTION_APPROVED)  {
                return sap.ui.core.ValueState.Success;
            }
            else  {
                return sap.ui.core.ValueState.Warning;
            }
        },

        getAnnotations: function(annotations)  {
            if (annotations && annotations.length > 0)  {
                return true;
            }
            else  {
                return false;
            }
        },

        hasItems: function(val)  {
            if (val === 0)  {
                return true;
            }
            else  {
                return false;
            }
        },

        getAnnotationIcon: function(val)  {
            if (val === 'labels')  {
                return "sap-icon://tag";
            }
            else if (val === "text")  {
                return "sap-icon://SAP-icons-TNT/note";
            } 
            else if (val === "faces")  {
                return "sap-icon://BusinessSuiteInAppSymbols/icon-face-happy";
            } 
            else  {
                return "sap-icon://sys-help";
            }
        },

        getImageryIcon: function(val)  {
            if (val && val.toUpperCase() === 'TRAINING')  {
                return "sap-icon://education";
            }
            else if (val &&  val.toUpperCase() === 'VALIDATION')  {
                return "sap-icon://validate";
            }
            else if (val &&  val.toUpperCase() === 'TEST') {
                return "sap-icon://lab";
            }
            else  {
                return "sap-icon://sys-help";
            }
        },

        isAnnotationStatsMoreThanZero: function(val)  {
            if (val && val.length > 0)  {
                return true;
            }
            else  {
                return false;
            }
        },

        getImagePackageTypeIcon: function(val)  {
            if (val === 'FMV')  {
                return "sap-icon://video";
            }
            else  {
                return "sap-icon://image-viewer";
            }
        }
    };
});