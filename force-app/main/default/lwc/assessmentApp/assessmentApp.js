import { LightningElement, api, track, wire } from 'lwc';
//import getAssess from '@salesforce/apex/assessment.getAssess';
import { refreshApex } from '@salesforce/apex';
import getAssessments from '@salesforce/apex/assessment.getAssessments';
import getAllQuestions from '@salesforce/apex/AssessmentController.getAllQuestions';
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from 'lightning/uiRecordApi';
import result from '@salesforce/schema/Result__c';

const { setInterval, clearTimeout } = window;

export default class assessmentApp extends NavigationMixin(LightningElement) {

 candId;
 assessId;
 assessName;
 candName;
 
numQues=0;
numMins=0;

@track showModal = false;
closeModal(){
    this.showModal=false;       
}
@track showModal1 = false;
closeModal1(){
    this.showModal1=false;       
}
@track showModal2 = false;
closeModal2(){
    this.showModal2=false;   
    
    window.location.replace("https://bhavani23-dev-ed.my.site.com/assessment/secur/logout.jsp");
    
  //   this[NavigationMixin.Navigate]({
  //     type: 'comm__logoutPage',
  //     attributes: {
  //       actionName: 'logout'
  //     }
  // });
}

@track examStarted = false;
    @track questionWrapper =[];
    @track selectedAssessmentId=this.assessId;   

    @track submitButtonDisabled = false;
    @track assessmentSelected = false;
    @track shuffledQuestionWrapper = [];
    
    timerInterval;
    timerMinutes = this.numMins;
    timerSeconds = '00';
    timer;
    @track score = 0;
    @track selectedAnswer; 

    connectedCallback(){
      let oldurl=window.location.href;
      let newurl=new URL(oldurl).searchParams;
      this.candId= newurl.get('candId');
      this.candName= newurl.get('candName');
      this.assessId= newurl.get('assessId');
      this.assessName= newurl.get('assessName');
      this.numQues= newurl.get('numQues');
      this.numMins= newurl.get('numMins');
      console.log('candidate Id:'+this.candId+', candidate Name:'+this.candName+', Assessment Name:'+this.assessName+', Assessment Id:'+this.assessId);
    }   

//     import { CurrentPageReference } from 'lightning/navigation';

//         currentPageReference = null;

//  @wire(CurrentPageReference)
//     getStateParameters(currentPageReference) {
//        if (currentPageReference) {
//            this.caseId = currentPageReference.state.caseRecordId;
//        }
//     }

    startTimer() {
        let seconds = this.numMins * 60;
       this.timerInterval = setInterval(() => {
            seconds--;
            this.timerMinutes = Math.floor(seconds / 60).toString().padStart(2, '0');
            this.timerSeconds = (seconds % 60).toString().padStart(2, '0');

            if(seconds==30){
              this.showModal1=true; 
            }

            if (seconds === 0) {
               // this.showModal=true;               
                clearInterval(this.timerInterval);
                this.Finish();
            }
        }, 1000);
    }   

    handleTimeUp() {
      clearInterval(this.timerInterval);
    }  

    //getQuestions() {
        @wire(getAllQuestions, { assessment: '$assessId', numQue: '$numQues' })
           // .then((result) => {
            ques({data,error}){
                if(data){                
                    console.log('Assessment Id : ', this.assessId);    
                this.examStarted = true;
                this.questionWrapper = data;
               // this.startButtonDisabled = true;
                this.startTimer();
                }
                if(error){
                    console.error('Error fetching questions', error);
                }                
            }
                
           // })
            // .catch((error) => {
            //     console.error('Error fetching questions', error);
            // });
   // }

    onSubmit(event) {
      this.submitButtonDisabled = true;
      this.showModal=true;
    }
    Finish(){
      this.showModal=false; 
      this.submitButtonDisabled = true;
        let score = 0;
        for (let i = 0; i < this.questionWrapper.length; i++) {
            const question = this.questionWrapper[i].question;
            const selectedOption = this.questionWrapper[i].selectedAnswer;
            if (selectedOption === question.Answer__c) {
                score++;
            }
        }
        let wrong=this.questionWrapper.length-score;
        // alert('Your Score Is ' + score);
        // alert('Wrong ' + wrong);


       var field={'Correct_Answers__c':score,'Score__c':score,'Candidate__c':this.candId,'Assesment__c':this.assessId, 'Wrong_Answers__c':wrong}; 
             const res_details={apiName:result.objectApiName, fields: field };

             createRecord(res_details)
             .then(response=>{               
                alert("Result is created with ID : "+response.id);    
            
                this.handleTimeUp();

               this.showModal2=true;    
             })
             .catch(error=>{               
                alert("Some error has occured :"+JSON.stringify(error)+this.candId);
             });
    }  

    startTest() {
        this.examStarted = true;
        this.questionWrapper = this.questions.map((question, index) => ({
          qNo: index + 1,
          question: question,
          options: question.Options,
          selectedAnswer: null
        }));
        this.startTimer();
      } 

      handleOptionChange(event) {
        const selectedOption = event.detail.value;
        const questionId = event.target.name;      

        // Find the index of the question in the questionWrapper array based on questionId
        const questionIndex = this.questionWrapper.findIndex((q) => q.question.Id === questionId);      

        // Make a deep copy of the question object
        const updatedQuestion = { ...this.questionWrapper[questionIndex] };       

        // Check if the selected option is the same as the currently selectedAnswer
        if (updatedQuestion.selectedAnswer === selectedOption) {

        // Deselect the option
          updatedQuestion.selectedAnswer = null;
        } else {
          // Select the option
          updatedQuestion.selectedAnswer = selectedOption;
        }       

        // Update the questionWrapper array with the modified question object
        this.questionWrapper = [
          ...this.questionWrapper.slice(0, questionIndex),
          updatedQuestion,
          ...this.questionWrapper.slice(questionIndex + 1)
        ];
        console.log(this.questionWrapper); // For testing and debugging
      }
    //   saveExamState() {
    //     const examState = {
    //         questionWrapper: this.questionWrapper,
    //         remainingTime: this.remainingTime,
    //         selectedAssessmentId: this.selectedAssessmentId,
    //         candidateId: this.candidateId,
    //         assessmentId: this.assessmentId
    //     };
    //     localStorage.setItem('examState', JSON.stringify(examState));
    // }
    
      handleResetClick(event) {
        const questionId = event.target.dataset.questionid;
        const questionIndex = this.questionWrapper.findIndex(question => question.question.Id === questionId);
        
        if (questionIndex !== -1) {
            this.questionWrapper[questionIndex].selectedAnswer = null;
        }
        //this.saveExamState();
    } 
  
}