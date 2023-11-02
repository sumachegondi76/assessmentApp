public with sharing class invitation {
    @AuraEnabled
    public static String sendMail(String body, String toSend, String subject) {
      try {
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String[] toAddresses = new List<String>{ toSend };
        mail.setToAddresses(toAddresses);
        mail.setSubject(subject);
        mail.setHtmlBody('<h3>' + body + '</h3>');
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ mail });
        return 'Sent successfully!';
      } catch (Exception ex) {
        return 'Failed to send: ' + ex.getMessage();
      }
    }
  
    @AuraEnabled(cacheable=true)
    public static list<Candidate_Email__c> getCandidateEmail(string cId) {
      try {
        return [
          SELECT
            Id,
            Assessment__c,
            Candidate_Name__c,
            Email__c,
            Experience__c,
            Phone__c,
            Invite_Count__c
          FROM Candidate_Email__c
          WHERE Id = :cId
        ];
      } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
      }
    }
  }