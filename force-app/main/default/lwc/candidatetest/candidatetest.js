
import { LightningElement, wire, track } from 'lwc';
import getAssess from '@salesforce/apex/candidateform.getAssess';
import getAssessDet from '@salesforce/apex/candidateform.getAssessDet';
import { createRecord } from 'lightning/uiRecordApi';
import Cand from '@salesforce/schema/Candidate__c';
//import createCandidate from '@salesforce/apex/candidate.createCandidate';
import { NavigationMixin } from 'lightning/navigation';
import getCandidate from '@salesforce/apex/candidateform.getCandidate';
import getCandidateEmails from '@salesforce/apex/candidateform.getCandidateEmails';
const { setInterval, clearTimeout } = window;
export default class candidatetest extends NavigationMixin(LightningElement) {

    @track qualificationOptions = [
        { label: 'Secondary education or high school', value: 'Secondary education or high school' },
        { label: 'Vocational qualification', value: 'Vocational qualification' },
        { label: 'Bachelors degree', value: 'Bachelors degree' },
        { label: 'Masters degree', value: 'Masters degree' },
        { label: 'Doctorate or higher', value: 'Doctorate or higher' },
    ];

    name;   
    email;
    date;
    phone; 
    qual;  
    assessName;
    assess;  
    currentDate;

    candId;
    numQues=0;
    numMins=0;
    timer;
    @track em;
    timerSeconds = '00';
    @track showModal = false;
    isCandidateCreated = false;
    //isButtonDisabled = false;
    remainingTime = 20; // Timer duration in seconds
    @track startButtonDisabled = false;

    


    connectedCallback() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.currentDate = `${year}-${month}-${day}`;
        this.date=this.currentDate;
    }       

        @track l_All_Types;
        @track assessOptions;
     
        @wire(getAssess, {})
        WiredObjects_Type({ error, data }) {
     
            if (data) {
                try {
                    this.l_All_Types = data; 
                    let options = [];
                     
                    for (var key in data) {
                        // Here key will have index of list of records starting from 0,1,2,....
                        options.push({ label: data[key].Name, value: data[key].Id  });    
                       
                    }
                    this.assessOptions = options;
                     
                } catch (error) {
                    console.error('Hi===== check error here', error);                    
                }
            } else if (error) {
                console.error('Hi+++++ check error here', error);               
            }
     
        }
     
        handleAssessChange(event){
            this.assess = event.target.value; 
            this.assessName=event.target.options.find(opt => opt.value === event.detail.value).label; 
            
            getAssessDet({assId: this.assess})
            .then(result => {
                this.numQues = result[0].No_of_Questions_to_Answer__c;
                this.numMins = result[0].Time__c;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                
            });           

        }  
        
    
        
              createCandidateRecord() {
                        const field = {
                            'Candidate_Name__c': this.name,
                            'Email__c': this.email,
                            'Phone__c': this.phone,
                            'Assessment__c': this.assess,
                            'Qualification__c': this.qual
                        };
                        const can_details = { apiName: Cand.objectApiName, fields: field };
    
                        createRecord(can_details)
                            .then(response => {
                                this.candId = response.id;
                                this.isCandidateCreated = true;
                                this.navigateToAssessment();
                                // this.showModal = true;
                                // this.isCandidateCreated = true;
                                // this.timer = setTimeout(() => {
                                //     this.showModal = false;
                                //     this.StartTest();
                                // }, 60000);
                                this.resetTimer(); // Reset the timer values
                                this.startTimer(); 
                        
                            //     // Start the timer display
                            //     this.startTimerDisplay();
                            // this.timer = setTimeout(() => {
                            //     this.showModal = false;
                            //     this.StartTest();
                            // }, this.numMins * 20 * 1000); // Timer duration in milliseconds
                
                            // Start the timer display
                           //this.startTimer();
                            })
                            .catch(error => {
                                console.log('Name', this.name, 'Email__c', this.email, 'Phone__c', this.phone, 'Assessment__c', this.assess, 'Date', this.date, 'Qualification__c', this.qual);
                                alert(error.body.message);
                            })
                            .finally(() => {
                                this.isButtonDisabled = false; // Reset the flag
                            });
                    }
                   
                    startTimer() {
                        this.timer = setInterval(() => {
                          if (this.remainingTime > 0) {
                            this.remainingTime--;
                          } else {
                            clearInterval(this.timer);
                            this.handleTimeUp();
                            this.goToAssessment();
                          }
                        }, 1000);
                      }
                    // this.timerInterval = setInterval(() => {
                    //     this.remainingTime -= 1000;
                    //     this.timerSeconds = (Math.floor(this.remainingTime / 1000) % 60).toString().padStart(2, '0');
                    
                    //     if (this.remainingTime <= 0) {
                    //       clearInterval(this.timerInterval);
                    //       this.handleTimeUp();
                    //     }
                    //   }, 1000);
                    // }
                      
                    goToAssessment(){
                        // Check if the candidate record is already created
                        if (this.isCandidateCreated) {
                            this.navigateToQuestionsPage();
                          } else {
                            // Create the candidate record
                            this.createCandidateRecord();
                          }
                    }
                    
                      handleTimeUp() {
                        // Clear the timer interval
                        clearInterval(this.timerInterval);                         
                         this.remainingTime=20;
                        this.showModal = false; // Hide the popup                   
                        
                      }
                      resetTimer() {
                        clearInterval(this.timer); // Clear the timer
                        this.timerSeconds = '00'; // Reset the timer seconds to '00'
                        this.startTimer(); // Reset the remaining time to the initial duration
                      }

                      

        handleQualiChange(event){
            this.qual = event.target.value; 
            //this.assessName=event.target.options.find(opt => opt.value === event.detail.value).label;            
        }  

 handleEmailChange(event) {
        this.em = event.target.value;
        console.log('Email : ',this.em);
    }

   

        handleClick(event){
            var inp=this.template.querySelectorAll("lightning-input");

            inp.forEach(function(ele){                
                if(ele.name=="name")
                this.name=ele.value;                             
                if(ele.name=="email")
                this.email=ele.value;
                if(ele.name=="phone")
                this.phone=ele.value;                              
            },this); 
             const enteredEmail = this.em;

   if (!enteredEmail) {
        // // Email field is empty
        // alert('Please enter an email.');
        return;
   }

    // Check for duplicate emails in the CandidateEmail object
    getCandidate({ email: enteredEmail })
        .then(candidateEmailData => {
            if (candidateEmailData && candidateEmailData.length > 0) {
                // Duplicate email found in the CandidateEmail object
                alert('Duplicate email found. Please enter a unique email.');
            } 
        
            else {
                getCandidateEmails({ email: enteredEmail })
                .then(candidateData => {
                    console.log('Candidate Data:', candidateData); // Log the data returned by the API call
                    if (candidateData && candidateData.length > 0) {
                        // Candidate with the entered email found
                        const candidate = candidateData[0];
                        if (candidate.Email !== enteredEmail) {
                            // Entered email matches the candidate object's email
                            this.showModal = true;
                            this.startTimer();
                        } else {
                            // Entered email does not match the candidate object's email
                            alert('Email does not match the candidate.');
                        }
                    }
                else {
                        // Candidate with the entered email not found
                        alert('Email does not match the candidate email.');
                    }
                
                
                })
                
                .catch(error => {
                    console.error('Error retrieving candidate data', error);
                });
        }
        
    })
    .catch(error => {
        console.error('Error retrieving candidate email data', error);
    });
}

        


        
        StartTest(){
            // this[NavigationMixin.Navigate]({
            //     type: "standard__component",
            //     attributes: {
            //         componentName: "c__NavigationToQuesHelper"
            //     },
            //     state: {
            //          c__candId: this.candId,   
            //         c__assessId: this.assess,
            //         c__assessName: this.assessName,
            //         c__candName: this.name
            //     }
            // });
            // if (this.isButtonDisabled) {
            //     // Prevent multiple clicks
            //     return;
            // }
            
            this.startButtonDisabled = true; 
            if (this.isCandidateCreated ) {
                // Prevent duplicate record creation or starting test without creating a record
                this.navigateToAssessment();
              }
              else {
                this.createCandidateRecord();
            }
    
            }
            navigateToAssessment() {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'assessment__c'
                },
                state: {
                             'candId': this.candId,   
                            'assessId': this.assess,
                            'assessName': this.assessName,
                            'candName': this.name,
                            'numQues':this.numQues,
                            'numMins': this.numMins
                        }
            });
        }

        closeModal() {
            clearTimeout(this.timer); 
            // Clear the timer
            this.handleTimeUp(); // Clear the timer interval
            this.showModal = false;
          //  this.remainingTime = 0;
           // this.createCandidateRecord();
         //  this.resetTimer();
           // this.showModal = true; 
           // this.startTimer(); 
          }
}