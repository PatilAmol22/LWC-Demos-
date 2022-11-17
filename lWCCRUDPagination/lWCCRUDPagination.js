import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

import getACC from '@salesforce/apex/AccHandler.getACC';
import getAccounts from '@salesforce/apex/AccHandler.getAccounts';
import deleteAccounts from '@salesforce/apex/AccHandler.deleteAccounts';
import deleteSelectedAccounts from '@salesforce/apex/AccHandler.deleteSelectedAccounts';
import getAccountSearch from '@salesforce/apex/AccHandler.getAccountSearch';
//import serachAccs from '@salesforce/apex/AccHandler.retriveAccs';
import { createRecord } from 'lightning/uiRecordApi';

// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

// importing to refresh the apex if any record changes the datas
import AccMainObject from '@salesforce/schema/Account';
import AccName from '@salesforce/schema/Account.Name';
import AccAccountNumber from '@salesforce/schema/Account.AccountNumber';
import AccPhone from '@salesforce/schema/Account.Phone';
import AccEmail from '@salesforce/schema/Account.Email__c';
import AccDate from '@salesforce/schema/Account.Date__c';
import AccOwnership from '@salesforce/schema/Account.Ownership';

//Custom Labels
import Account_Creator from '@salesforce/label/c.Account_Creator';
import Account_Information from '@salesforce/label/c.Account_Information';
import Account_Name from '@salesforce/label/c.Account_Name';
import Account_Number from '@salesforce/label/c.Account_Number';
import Phone from '@salesforce/label/c.Phone';
import Ownership from '@salesforce/label/c.Ownership';
import Close from '@salesforce/label/c.Close';
import Submit from '@salesforce/label/c.Submit';
import Cancel from '@salesforce/label/c.Cancel';
import Save from '@salesforce/label/c.Save';
import Delete_Record from '@salesforce/label/c.Delete_Record';
import Show_Related_Accounts from '@salesforce/label/c.Show_Related_Accounts';

// row actions
const actions = [   
        { label: 'Edit', name: 'edit'}, 
        { label: 'Delete', name: 'delete'}
        ];

const columns = [
        { label: Account_Name, fieldName: 'Name', 
        type: 'text', sortable: true, 
        editable: true, 
        hideDefaultActions: "true",
        
        
        },
        { label: Account_Number, 
            fieldName: 'AccountNumber',
            type: 'text', sortable: true, 
            editable: true, 
            hideDefaultActions: "true"

        },
        { label: Phone,
            fieldName: 'Phone', 
            sortable: true , 
            editable: true,
            hideDefaultActions: "true",
            cellAttributes: { 
                iconName: 'utility:call' 
            }

        },
        { label: 'Date', 
        fieldName: 'Date__c',
        type:'date-local',
        sortable: true,
        editable: true,
        hideDefaultActions: "true",
        cellAttributes: { 
            iconName: 'utility:event' 
        }


        },
        { label: 'Email', 
        fieldName: 'Email__c',
        sortable: true, 
        editable: true,
        hideDefaultActions: "true",
        cellAttributes: { 
            iconName: 'utility:email' 
        }

        },
        { label: Ownership, 
            fieldName: 'Ownership',
            sortable: true, 
            editable: true,
            hideDefaultActions: "true"

        },
        {label: 'Action',
        type: 'action',
        typeAttributes: { rowActions: actions,
                        menuAlignment: 'right', 
                        

        },
        hideDefaultActions: "true"
        }

];

export default class LWCCRUDPagination extends LightningElement {
        @track loader = false;
        @track isModalOpen = false;
        @track isModal1Open = false;
        @track value;
        @track error;
        @track data;
        @api sortedDirection = 'asc';
        @api sortedBy = 'Name';
        @api searchKey = '';
        result;
        @api recordId;
        @api nameSearch;
        @api Phone;
        @api AccountEmail;

        @track allSelectedRows = [];
        @track page = 1;
        @track items = [];
        @track data = [];
        @track columns;
        @track startingRecord = 1;
        @track endingRecord = 0;
        @track pageSize = '5';
        @track totalRecountCount = 0;
        @track totalPage = 0;
        @track isEditForm = false;
        @track searchType = '';
        @track mydata;
        isPageChanged = false;
        initialLoad = true;

        mapAccount = new Map();

       
    
get options() {
    return [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '15', value: '15' },
    ];
}

label = {
        AccountCreator : Account_Creator,
        AccountInformation : Account_Information,
        AccountName : Account_Name,
        Accountnumber : Account_Number,
        phone : Phone,
        ownership : Ownership,
        close : Close,
        DeleteRecord:Delete_Record,
        cancel : Cancel,
        save : Save,
        submit : Submit,
        ShowRelatedAccounts : Show_Related_Accounts,

};

@track
OwnershipValues = [
    {label: 'None', value:''},
    {label: 'Public', value:'Public'},
    {label: 'Private', value:'Private'},
    {label: 'Subsidery', value:'Subsidery'},
    {label: 'Other', value:'Other'},
];


get searchOptions() {
    return [
        { label: 'Select Search Type', value: '' },
        { label: 'Name', value: 'Name' },
        { label: 'Phone', value: 'Phone' },
        { label: 'Email', value: 'Email' }
    ];
}

Name = '';
Accountnumber = '';
Phone= '';
Email__c='';
Date__c='';
Ownership='';

handleNameChange(event) 
{
    this.Name=event.target.value; 
}
handlePhoneChange(event)
{
    this.Phone=event.target.value;
}
handleNumberChange(event)
{
    this.Accountnumber=event.target.value;
}
handleDateChange(event)
{
this.Date__c=event.target.value;
}
handleEmailChange(event)
{
this.Email__c=event.target.value;
}
handleOwnershipChange(event) 
{
this.Ownership=event.target.value;
}


createAccount()
    {
        console.log(this.selectedAccountId);
        const fields = {};
        fields[AccName.fieldApiName] = this.Name;
        fields[AccAccountNumber.fieldApiName] = this.Accountnumber;
        fields[AccPhone.fieldApiName] = this.Phone;
        fields[AccEmail.fieldApiName] = this.Email__c;
        fields[AccDate.fieldApiName] = this.Date__c;
        fields[AccOwnership.fieldApiName] = this.Ownership;
        const recordInput = { apiName: AccMainObject.objectApiName, fields };

        createRecord(recordInput)
            .then(accountobj=> {
                this.name= accountobj.id;
                this.dispatchEvent(
                    new ShowToastEvent({

                        title: 'Success',
                        message: 'Account record has been created',
                        variant: 'success',
                    }),
                );
                

            this.loader = true;
            refreshApex(this.refreshTable);
            eval("$A.get('e.force:refreshView').fire();");

            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    // non-reactive variables
    selectedRecords = [];
    refreshTable;
    error;
    searchData;
    columns = columns;
    errorMsg = '';
    strSearchAccName = '';
    draftValues = [];

handleChange(event) {
    this.pageSize = event.detail.value;
    this.processRecords(this.items);

}

@wire(getACC, { accId: '$recordId' })
Accounts;

//Refresh Table
@wire(getAccounts, { searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection' })
refreshTable;

// retrieving the data using wire service
@wire(getAccounts, { searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection' })
wiredAccounts({ error, data }) {
    
    this.loader = true;
    if (data) {
        this.loader = false;
        this.processRecords(data);
        this.error = undefined;
        
    } else if (error) {
        this.loader = false;
        this.error = error;
        this.data = undefined;
    }

}

handleRowActions(event) 
{
    let actionName = event.detail.action.name;

    window.console.log('actionName ====> ' + actionName);

    let row = event.detail.row;
    this.data=this.data;

    window.console.log('row ====> ' + row);
    // eslint-disable-next-line default-case
    switch (actionName) {
        case 'edit':
            this.editCurrentRecord(row);
            
            break;
        case 'delete':
            this.deleteAcc(row);
            break;
    }
}

// view the current record details
viewCurrentRecord(currentRow)
    {
    this.isModal1Open = true;
    this.isEditForm = false;
    this.record = currentRow;
    
}

// closing modal box
closeModal2()
    {
    this.isModal1Open = false;
    
}


editCurrentRecord(currentRow) 
{
    // open modal box
    this.isModal1Open = true;
    this.isEditForm = true;
    // assign record id to the record edit form
    this.currentRecordId = currentRow.Id;
    

}

// handleing record edit form submit
handleSubmit(event) 
{
    // prevending default type sumbit of record edit form
    event.preventDefault();

    // querying the record edit form and submiting fields to form
    this.template.querySelector('lightning-record-edit-form').submit(event.detail.fields);

    // closing modal
    this.isModal1Open = false;
    
    // showing success message
    this.dispatchEvent(new ShowToastEvent({
        title: 'Success!!',
        message: '${event.detail.fields.Name}  Account updated Successfully!!.',
        variant: 'success'
        
    }),);
    
    

}

// refreshing the datatable after record edit form success
handleSuccess() 
{
        
    this.loader = true;
    refreshApex(this.refreshTable);
    
    
}

deleteAcc(currentRow) 
{
    let currentRecord = [];
    currentRecord.push(currentRow.Id);
    this.loader = true;
    

    // calling apex class method to delete the selected contact
    deleteAccounts({lstAccIds: currentRecord})
    .then(result => {
        window.console.log('result ====> ' + result);
        this.loader = false;

        // showing success message
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success!!',
            message: `${currentRow.Name} Account deleted.`,
            variant: 'success'
        }),);

        // refreshing table data using refresh apex
        
        // eval("$A.get('e.force:refreshView').fire();")
        this.loader = true;
        refreshApex(this.refreshTable);

    })
    .catch(error => {
        window.console.log('Error ====> '+error);
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error!!', 
            message: error.message, 
            variant: 'error'
        }),);
    });
}

/*Pagination Functionality*/
processRecords(data) {
    this.items = data;
    this.totalRecountCount = data.length;
    this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
    this.data = this.items.slice(0, this.pageSize);
    this.endingRecord = this.pageSize;
    this.columns = columns;
}

//clicking on previous button this method will be called
previousHandler() {
    this.isPageChanged = true;
    if (this.page > 1) {
        this.page = this.page - 1; //decrease page by 1
        this.displayRecordPerPage(this.page);
    }
    var selectedIds = [];
    for (var i = 0; i < this.allSelectedRows.length; i++) {
        selectedIds.push(this.allSelectedRows[i].Id);
    }
    this.template.querySelector('[data-id="table"]').selectedRows = selectedIds;
}

//clicking on next button this method will be called
nextHandler() {
    this.isPageChanged = true;
    if ((this.page < this.totalPage) && this.page !== this.totalPage) {
        this.page = this.page + 1; //increase page by 1
        this.displayRecordPerPage(this.page);
    }
    var selectedIds = [];
    for (var i = 0; i < this.allSelectedRows.length; i++) {
        selectedIds.push(this.allSelectedRows[i].Id);
    }
    this.template.querySelector('[data-id="table"]').selectedRows = selectedIds;
}

//Method to displays records page by page
displayRecordPerPage(page) {
    this.startingRecord = ((page - 1) * this.pageSize);
    this.endingRecord = (this.pageSize * page);
    this.endingRecord = (this.endingRecord > this.totalRecountCount) ? this.totalRecountCount : this.endingRecord;
    this.data = this.items.slice(this.startingRecord, this.endingRecord);
    this.startingRecord = this.startingRecord + 1;
}

sortColumns(event) {
    this.sortedBy = event.detail.fieldName;
    this.sortedDirection = event.detail.sortDirection;
    return refreshApex(this.result);
}

handleKeyChange(event) {
    this.searchKey = event.target.value;
    var data = [];
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i] != undefined && this.items[i].Name.includes(this.searchKey)) {
            data.push(this.items[i]);
        }
    }
    this.processRecords(data);
}
//Search Functionality
/*handleKeyChange(event) {
    this.errorMsg = '';
    this.strSearchAccName = event.currentTarget.value;
}

handleSearch() {
    if(!this.strSearchAccName) {
        this.errorMsg = 'Please enter account name to search.';
        this.searchData = undefined;
        return;
    }

    serachAccs({strAccName : this.strSearchAccName})
    .then(result => {
        this.searchData = result;
    })
    .catch(error => {
        this.searchData = undefined;
        if(error) {
            if (Array.isArray(error.body)) {
                this.errorMsg = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.errorMsg = error.body.message;
            }
        }
    }) 
}*/


onRowSelection(event) {
const selectedRows = event.detail.selectedRows;
this.recordsCount = event.detail.selectedRows.length;
this.selectedRecords=new Array();
for (let i = 0; i < selectedRows.length; i++) {
    this.selectedRecords.push(selectedRows[i]);
}        


    if (!this.isPageChanged || this.initialLoad) {
        if (this.initialLoad) this.initialLoad = false;
        this.processSelectedRows(event.detail.selectedRows);
        

    } 
    else {
        this.isPageChanged = false;
        this.initialLoad = true;
    }

}

processSelectedRows(selectedAccounts) {

    var newMap = new Map();
    for (var i = 0; i < selectedAccounts.length; i++) {
        if (!this.allSelectedRows.includes(selectedAccounts[i])) {
            this.allSelectedRows.push(selectedAccounts[i]);
        }
        this.mapAccount.set(selectedAccounts[i].Name, selectedAccounts[i]);
        newMap.set(selectedAccounts[i].Name, selectedAccounts[i]);
    }
    for (let [key, value] of this.mapAccount.entries()) {
        if (newMap.size <= 0 || (!newMap.has(key) && this.initialLoad)) {
            const index = this.allSelectedRows.indexOf(value);
            if (index > -1) {
                this.allSelectedRows.splice(index, 1);
            }
        }
    }

}
//Modal Popup Shows Accounts
showSelectedAccounts() {
    if (this.allSelectedRows != null && this.allSelectedRows.length > 0) {            
        this.isModalOpen = true;
    }
    else {
        //alert('Please select account record..!!');
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error!!', 
            message: "Please select account record..!!", 
            variant: 'error'
        }),);
    }
}

closeModal() {
    this.isModalOpen = false;
}
//Pagination end//

//Delete Multiple Accounts
deleteRecords() {
    if (this.selectedRecords) {
        this.buttonLabel = 'Processing....';
        deleteSelectedAccounts({accountLst: this.selectedRecords }).then(result => {
            window.console.log('result ====> ' + result);
            this.buttonLabel = 'Delete Records';
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: this.recordsCount + ' records are deleted.',
                    variant: 'success'
                }),
            );
            return refreshApex(this.refreshTable);

        })

    }else if(this.selectedRecords==0)
    {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error while getting Accounts',
                _message: JSON.stringify(error),
                get message() {
                    return this._message;
                },
                set message(value) {
                    this._message = value;
                },
                variant: 'error'
            }),
        );
    }
}

//Inline Editing Update 
async handleSave(event) {
    // Convert datatable draft values into record objects
    const records = event.detail.draftValues.slice().map((draftValue) => {
        const fields = Object.assign({}, draftValue);
        return { fields };
    });

    // Clear all datatable draft values
    this.draftValues = [];

    try {
        // Update all records in parallel thanks to the UI API
        const recordUpdatePromises = records.map((record) =>
            updateRecord(record)
        );
        await Promise.all(recordUpdatePromises);

        // Report success with a toast
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Accounts updated',
                variant: 'success'
            })
        );

        // Display fresh data in the datatable
        return refreshApex(this.refreshTable);
        // await refreshApex(this.Accounts);
    } catch (error) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error updating or reloading Accounts',
                message: error.body.message,
                variant: 'error'
            })
        );
    }
}

//Dynamic Search Functionality

  
handleNameKeyChange( event ) {
    window.console.log('Inside Name');
    this.page = 1; 
    event.target.name == 'nameSearch'
    this.nameSearch = event.target.value;
    var data = [];
    for(var i=0; i<this.items.length;i++){
    if(this.items[i]!= undefined && this.items[i].Name.includes(this.nameSearch)){
    data.push(this.items[i]);
    }
    }
    //this.processRecords(data);
    }
   
   handlePhoneKeyChange( event ) {
    this.page = 1; 
    event.target.name == 'Phone'
    this.Phone = event.target.value;
    console.log('Phone'+this.carName)
    var data = [];
    for(var i=0; i<this.items.length;i++){
    if(this.items[i]!= undefined && this.items[i].Name.includes(this.Phone)){
    data.push(this.items[i]);
    }
    }
    // this.processRecords(data);
    }
   
   handleEmailKeyChange( event ) {
    this.page = 1; 
    event.target.name == 'AccountEmail'
    this.AccountEmail = event.target.value;
    var data = [];
    for(var i=0; i<this.items.length;i++){
    if(this.items[i]!= undefined && this.items[i].Name.includes(this.AccountEmail)){
    data.push(this.items[i]);
    }
    }
    // this.processRecords(data);
    }
    
    
searchAccount(){
    getAccountSearch({nameSearch: this.nameSearch, Phone: this.Phone, AccountEmail: this.AccountEmail})
    .then(data=>{
    console.log(data);
    this.page = 1; 
    this.totalRecountCount = data.length; 
    this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
    this.data = this.items.slice(0,this.pageSize); 
    this.endingRecord = this.pageSize;
    this.columns = columns; 
    this.processRecords(data);
    // this.totalRecountCount = data.length;
    // this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);
    // //here we slice the data according page size
    // this.data = this.items.slice(0,this.pageSize); 
    // this.endingRecord = this.data.length; 
    // this.currentPageSize = this.endingRecord - this.startingRecord + 1;
    }) .catch(error=>{
    console.log(error);
    this.error = error;
    this.data = undefined;
    
    // this.showToast(this.error, 'Error', 'Error'); //show toast for error
    })
    }

    handleAccountSelection(event){
        //this.accountName = event.detail.Name;
        //this.accountId = event.detail.Id;
        console.log("the selected record id is"+event.detail);
        console.log('accountname - ',event.detail.Name );
        console.log("accountId - ",event.detail.ID);

        
    }
}




