import { LightningElement, wire, api } from "lwc";
import sendMail from "@salesforce/apex/invitation.sendMail";
import getCandidateEmail from "@salesforce/apex/invitation.getCandidateEmail";
import { updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class InviteCandidate extends LightningElement {
  @api recordId;

  subject = "Invitation For Online Assessments";
  bdy = "";
  toSend = ""; //kancharlanreddy@gmail.com
  name;
  assess;
  count;
  buttonC;
  inviteButtonDisabled = false;

  @wire(getCandidateEmail, { cId: "$recordId" })
  candEmail({ data, error }) {
    if (data) {
      this.toSend = data[0].Email__c;
      this.name = data[0].Candidate_Name__c;
      this.assess = data[0].Assessment__c;
      console.log("Count 0 : ", data[0].Invite_Count__c);
      if (!data[0].Invite_Count__c) {
        this.count = 0;
        // console.log("Count 1 : ", this.count);
      } else {
        this.count = data[0].Invite_Count__c;
        // console.log("Count 2 : ", this.count);
      }
      // console.log("Email: ", this.toSend);
      this.buttonClass();
    } else if (error) {
      this.showToast(
        "ERROR",
        "Failed to get the Invitee Email: " + error.body.message,
        "error"
      );
      console.log("Email Related Error:", error.body.message);
    }
  }

  sendEmail() {
    console.log("Email 1: ", this.toSend);
    this.bdy = `Hi ${this.name},<br><br> 
                Greeting from RH!! <br><br> We are inviting you to attend the online 
                assessment on ${this.assess} conducting by RH. <br><br> 
                Link: https://bhavani23-dev-ed.my.site.com/hospital/s/candidates?candId=${this.recordId} <br><br> 
                UName: nreddykancharla@gmail.com  <br> 
                Password: Surender@3974 <br><br> 
                Thank You, <br> 
                Team RH.`;

    const recordInput = {
      body: this.bdy,
      toSend: this.toSend,
      subject: this.subject
    }; //We can send parameters
    sendMail(recordInput)
      .then(() => {
        //  alert("Invite Sent Successfuly!");
        this.showToast("Success", "Invite Sent Successfuly.", "success");

        this.UpdateInviteCount();
      })
      .catch((error) => {
        //  alert("Failed to send the invite",error.body.message);
        this.showToast(
          "ERROR",
          "Failed to send the invite: " + error.body.message,
          "error"
        );
      });
  }

  UpdateInviteCount() {
    // console.log("Count 3 : ", this.count);
    if (this.count === 0) {
      this.count = 1;
      // console.log("Count 5 : ", this.count);
    } else {
      this.count += 1;
      // console.log("Count 4 : ", this.count);
    }

    console.log("ID : ", this.recordId);
    const InviteCount = {
      fields: {
        Id: this.recordId,
        Invite_Count__c: this.count
      }
    };

    updateRecord(InviteCount)
      .then(() => {
        this.buttonClass();
        // console.log("Invite Count Updated!");
      })
      .catch((error) => {
        console.log("Error updating Invite Count:", error.message.body);
      });
  }

  buttonClass() {
    if (this.count === 1) {
      this.buttonC = "blue-button";
    } else if (this.count === 2) {
      this.buttonC = "orange-button";
    } else if (this.count === 3) {
      this.buttonC = "red-button";
    } else if (this.count === 0) {
      this.buttonC = "green-button";
    } else {
      // Default class when count is not 1, 2, or 3
      this.buttonC = "default-button";
      this.inviteButtonDisabled = true;
    }
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