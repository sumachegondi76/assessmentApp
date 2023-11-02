import { LightningElement, api } from 'lwc';

export default class CustomModal extends LightningElement {
    @api modalTitle;
    @api modalMessage;

    closeModal() {
        const closeModalEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeModalEvent);
    }
}
