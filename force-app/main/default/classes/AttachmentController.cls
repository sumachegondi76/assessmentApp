public class AttachmentController {
    @AuraEnabled
    public static Id createAttachment(String parentId, String fileName, String contentType, String base64Data) {
        Attachment attachment = new Attachment();
        attachment.ParentId = parentId;
        attachment.Name = fileName;
        attachment.ContentType = contentType;
        attachment.Body = EncodingUtil.base64Decode(base64Data);

        try {
            insert attachment;
            return attachment.Id;
        } catch (Exception ex) {
            System.debug('Error creating attachment: ' + ex.getMessage());
            return null;
        }
    }
}