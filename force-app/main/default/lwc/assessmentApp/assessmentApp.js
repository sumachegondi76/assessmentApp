/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
import { LightningElement, track, wire } from "lwc";
import getAllQuestions from "@salesforce/apex/AssessmentController.getAllQuestions";
import { NavigationMixin } from "lightning/navigation";
import { createRecord } from "lightning/uiRecordApi";
import { updateRecord } from "lightning/uiRecordApi";
import result from "@salesforce/schema/Result__c";
import createAttachment from "@salesforce/apex/AttachmentController.createAttachment";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const { setInterval, clearTimeout } = window;

export default class Questions extends NavigationMixin(LightningElement) {
  candId;
  assessId;
  assessName;
  candName;
  exp;
  @track cap = false;

  numQues = 0;
  numMins = 0;
  Minutes;

  videoElement;
  mediaRecorder;
  recordedChunks = [];
  isVideoLoaded = false;

  @track showModal = false;
  closeModal() {
    this.showModal = false;
    this.submitButtonDisabled = false;
  }
  @track showModal1 = false;
  closeModal1() {
    this.showModal1 = false;
  }
  @track showModal2 = false;
  closeModal2() {
    this.showModal2 = false;
    window.location.replace(
      "https://bhavani23-dev-ed.my.site.com/onlineExam/secur/logout.jsp"
    );
  }
  @track showModal3 = false;
  closeModal3() {
    this.showModal3 = false;
  }

  @track examStarted = false;
  @track questionWrapper = [];
  @track questionWrapper1 = [];
  @track selectedAssessmentId = this.assessId;

  @track submitButtonDisabled = false;
  @track assessmentSelected = false;
  @track shuffledQuestionWrapper = [];

  timerInterval;
  timerMinutes = this.numMins;
  timerSeconds = "00";
  timer;
  @track score = 0;
  @track selectedAnswer;

  //   constructor() {
  //     super();
  //    window.addEventListener('beforeunload', (event) => {
  //     // Cancel the event as stated by the standard.
  //     event.preventDefault();
  //     // Chrome requires returnValue to be set.
  //     event.returnValue = 'sample value';

  //     });
  //  }

  connectedCallback() {
    window.addEventListener("blur", this.handleBlur);

    let oldurl = window.location.href;
    let newurl = new URL(oldurl).searchParams;
    this.candId = newurl.get("candId");
    this.candName = newurl.get("candName");
    this.assessId = newurl.get("assessId");
    this.assessName = newurl.get("assessName");
    this.exp = newurl.get("exp");
    this.numQues = newurl.get("numQues");
    this.numMins = newurl.get("numMins");
    this.timerMinutes = this.numMins;
    this.Minutes = this.numMins + " : 00 Mins";
    // console.log('candidate Id:'+this.candId+', candidate Name:'+this.candName+', Assessment Name:'+this.assessName+', Assessment Id:'+this.assessId);

    //Updating Start time in candidate object
    const startTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    const candRecord = {
      fields: {
        Id: this.candId,
        Start_Time__c: startTime,
        Date__c: currentDate
      }
    };

    updateRecord(candRecord)
      .then(() => {
        console.log("Candidate record updated with Start time");
      })
      .catch((error) => {
        console.error("Error updating Candidate record Start time:", error);
      });
    //Updating Start time in candidate object completed here...

    // eslint-disable-next-line no-undef
    this.capture();
  }
  disconnectedCallback() {
    // Remove the 'blur' event listener when the component is removed
    window.removeEventListener("blur", this.handleBlur());
  }

  handleBlur() {
    var data = window.sessionStorage.getItem("somekey");
    if (data !== null) {
      sessionStorage.removeItem("somekey");

      //  this.showToast('ERROR','You can`t switch in between browser tabs, can`t hover on other apps!! If you lose focus one more time, we will automatically signedout you.', 'error');
      alert(
        "You can`t switch in between browser tabs, can`t hover on other apps!! If you lose focus one more time, we will automatically signedout you."
      );
    } else {
      alert("Logout Functionality! ");
      //    window.location.replace("https://bhavani23-dev-ed.my.site.com/hospital/secur/logout.jsp");
    }
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
      this.timerMinutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      this.timerSeconds = (seconds % 60).toString().padStart(2, "0");

      if (seconds == 30) {
        this.showModal1 = true;
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

  @wire(getAllQuestions, {
    assessment: "$assessId",
    numQue: "$numQues",
    ex: "$exp"
  })
  ques({ data, error }) {
    if (data) {
      // console.log('Assessment Id : ', this.assessId);
      this.examStarted = true;
      this.questionWrapper1 = data;
      console.log("Q Length: ", this.questionWrapper1.length);
      //   this.startTimer();
    }
    if (error) {
      this.showToast(
        "ERROR",
        "Error fetching questions: " + error.body.message,
        "error"
      );
    }
  }

  onSubmit(event) {
    this.submitButtonDisabled = true;
    this.showModal = true;
  }
  Finish() {
    this.showModal = false;
    this.submitButtonDisabled = true;
    let score = 0;
    let cq = 0;
    let wrong = 0;
    let unanswered =0;
    for (let i = 0; i < this.questionWrapper.length; i++) {
      const question = this.questionWrapper[i].question;
      const selectedOption = this.questionWrapper[i].selectedAnswer;
    if (selectedOption === question.Answer__c) {
        score += question.Marks__c;
        cq += 1;
      }
      else if (selectedOption === null) {
        unanswered += 1;
      }
      else{
    
           wrong += 1;
      }
    // if(selectedOption === null){
    //     unanswered += 1;
    //   }
    }
    //let unanswered = this.questionWrapper.length - wrong;
    // alert('Your Score Is ' + score);

    var field = {
      Correct_Answers__c: cq,
      Score__c: score,
      Candidate__c: this.candId,
      Assesment__c: this.assessId,
      Wrong_Answers__c: wrong,
      Unanswered__c:unanswered
    };
    const res_details = { apiName: result.objectApiName, fields: field };

    createRecord(res_details)
      .then((response) => {
        //alert("Result is created with ID : "+response.id);
        // this.showToast('Success',"Result is created with ID : "+response.id, 'success');
        this.handleTimeUp();

        //Updating end time in candidate object
        const endTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });

        const candidateRecord = {
          fields: {
            Id: this.candId,
            End_Time__c: endTime
          }
        };

        updateRecord(candidateRecord)
          .then(() => {
            console.log("Candidate record updated with end time");
          })
          .catch((error) => {
            console.error("Error updating Candidate record:", error);
          });
        //Updating end time in candidate object completed here...

        this.showModal2 = true;
      })
      .catch((error) => {
        this.submitButtonDisabled = false;
        alert("Some error has occured :" + JSON.stringify(error) + this.candId);
        this.showToast("ERROR", error.body.message, "error");
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
    const questionIndex = this.questionWrapper.findIndex(
      (q) => q.question.Id === questionId
    );

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
    // console.log('Selected Option: ',this.questionWrapper); // For testing and debugging
  }

  handleResetClick(event) {
    const questionId = event.target.dataset.questionid;
    const questionIndex = this.questionWrapper.findIndex(
      (question) => question.question.Id === questionId
    );

    if (questionIndex !== -1) {
      this.questionWrapper[questionIndex].selectedAnswer = null;
    }
  }

  // capture() {
  //   const video = this.template.querySelector(".videoelement");
  //   if (navigator.mediaDevices) {
  //       navigator.mediaDevices
  //           .getUserMedia({ video: true, audio: null })
  //           .then((stream) => {
  //               video.srcObject = stream;
  //               video.play();
  //               this.cap=true;
  //               this.questionWrapper = this.questionWrapper1;
  //               this.startTimer();
  //           })
  //           .catch(function (error) {
  //             if(error =='NotAllowedError: Permission denied'){
  //               alert('Please, give Audio & Video pemission to start the Assessment');
  //           }
  //               console.error("something went wrong: " + error);
  //           });
  //   }
  // }

  capture() {
    const video = this.template.querySelector(".videoelement");
    const audio = new Audio(); // Create a new audio element
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          video.srcObject = stream;
          audio.srcObject = stream;
          video.play();
          audio.pause();
          //       console.log('Media stream obtained:', stream);
          this.cap = true;
          this.questionWrapper = this.questionWrapper1;
          this.startTimer();
          this.mediaRecorder = new MediaRecorder(stream);
          //  console.log('Point 6:', this.mediaRecorder);
          // Handle recording data
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.recordedChunks.push(event.data);
              //   console.log('Point 0:', this.recordedChunks);
            } else {
              console.log("Point 1:");
            }
          };

          // Save the recorded data as an audio element source when recording stops
          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: "video/webm" });

            this.recordedChunks = [];
            //#########################################################################################################################
            const fileName = this.candName + "_video.webm"; // Provide a name for the video file

            const reader = new FileReader();

            reader.onloadend = async () => {
              const base64data = reader.result.split(",")[1];

              if (base64data) {
                try {
                  const attachmentId = await createAttachment({
                    parentId: this.candId, // Set the Salesforce record Id here if you want to associate the attachment with a specific record
                    fileName: fileName,
                    contentType: "video/webm",
                    base64Data: base64data
                  });

                  console.log("Attachment created successfully:", attachmentId);
                } catch (error) {
                  console.error("Error creating attachment:", error);
                }
              } else {
                console.error("Base64 string is empty.");
              }
            };

            reader.readAsDataURL(blob);
            this.videoRecorded = false;
            //#########################################################################################################################
          };

          // Start recording
          this.mediaRecorder.start();

          //   Stop recording after some time (optional)
          setTimeout(() => {
            this.mediaRecorder.stop();
          }, 8000); // Stop recording after 8 seconds (adjust as needed)
        })
        .catch(function (error) {
          if (error == "NotAllowedError: Permission denied") {
            alert(
              "Please, give Audio & Video pemission to start the Assessment"
            );
          }
          console.error("Something went wrong: " + error);
        });
    }
  }

  stop() {
    const video = this.template.querySelector(".videoelement");
    video.srcObject.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
  }

  showToast(title, message, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(evt);
  }
}
