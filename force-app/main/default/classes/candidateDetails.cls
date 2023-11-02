public with sharing class candidateDetails {    
    
    public class CandidateWrapper {
        @AuraEnabled
        public Candidate__c candidate;
        @AuraEnabled
        public Result__c result;
        @AuraEnabled
        public String candidateId;
      
        
        public CandidateWrapper(Candidate__c candidate, Result__c result) {
            this.candidate = candidate;
            this.result = result;
            this.candidateId = candidate.Id;
      
         }
    }

    @AuraEnabled(cacheable=true)
    public static List<CandidateWrapper> getCandidatesWithResults(string Search) {
         string ser='%'+Search+'%';
        List<CandidateWrapper> candidatesWithResults = new List<CandidateWrapper>();

        List<Candidate__c> candidates = [SELECT Id, Candidate_Name__c, Email__c, Assessment__c,Experience__c, Phone__c, Date__c, Start_Time__c,End_Time__c,
                                         Assessment__r.Name, Assessment__r.No_of_Questions_to_Answer__c,Assessment__r.Cutoff_Marks__c,
                                         (SELECT Score__c,Correct_Answers__c,Wrong_Answers__c,Unanswered__c FROM Results__r)
                                         FROM Candidate__c WHERE
                                                             (Assessment__r.Name LIKE:ser or Phone__c LIKE:ser or Email__c like:ser) order by Date__c desc];

        for (Candidate__c candidate : candidates) {
            Result__c result = candidate.Results__r.size() > 0 ? candidate.Results__r[0] : null;
            CandidateWrapper wrapper = new CandidateWrapper(candidate, result);
            candidatesWithResults.add(wrapper);
        }

        return candidatesWithResults;
    }

}
