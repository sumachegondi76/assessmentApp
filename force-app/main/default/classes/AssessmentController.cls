public with sharing class AssessmentController {
    
    // @AuraEnabled(cacheable=true)
    // public static List<Assessment__c> getAssess(string assessId){
    //     return [select Name from Assessment__c where id=: assessId];
    // }

    @AuraEnabled(cacheable=true)
    public static List<Assessment__c> getAssessments() {
        return [SELECT Id, Name FROM Assessment__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<QuestionWrapper> getAllQuestions(String assessment, Integer numQue) {
        // Retrieve questions based on the selected assessment
        Integer num=numQue;
        List<QuestionWrapper> qwList = new List<QuestionWrapper>();
        List<Question__c> questionList = [SELECT Id, Name, OptionA__c, OptionB__c, OptionC__c, OptionD__c, Answer__c FROM Question__c WHERE Assesment__c = :assessment];
        //questionList = shuffleQuestionList(questionList);
        if (questionList != null && questionList.size() > 0) {
            Integer[] randomOrder = getRandomOrder(questionList.size());
            Integer i = 1;
            for (Integer index : randomOrder) {
                if(i<=num){
                Question__c question = questionList[index];
                List<Options> optionsList = new List<Options>();
                QuestionWrapper qw = new QuestionWrapper();
                qw.question = question;
                qw.qNo = i;
                qw.selectedAnswer = '';
                optionsList.add(new Options(question.OptionA__c, 'A'));
                optionsList.add(new Options(question.OptionB__c, 'B'));
                optionsList.add(new Options(question.OptionC__c, 'C'));
                optionsList.add(new Options(question.OptionD__c, 'D'));
                qw.options = optionsList;
                qwList.add(qw);
                i++;
                }
            }
            return qwList;
        } else {
            return null;
        }
    }

    private static Integer[] getRandomOrder(Integer size) {
        Integer[] order = new Integer[size];
        for (Integer i = 0; i < size; i++) {
            order[i] = i;
        }      

        // Perform Fisher-Yates shuffle algorithm
        for (Integer i = size - 1; i > 0; i--) {
            Integer j = (Integer)Math.floor(Math.random() * (i + 1));
            Integer temp = order[i];
            order[i] = order[j];
            order[j] = temp;
        }
        return order;
    }

    public class QuestionWrapper {
        @AuraEnabled
        public Question__c question;
        @AuraEnabled
        public Integer qNo;
        @AuraEnabled
        public List<Options> options;
        @AuraEnabled
        public String selectedAnswer;
    } 

    public class Options {
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;

        public Options(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }
}
