import { LightningElement, track } from 'lwc';
import panther from '@salesforce/resourceUrl/panther';
export default class BlackPanther extends LightningElement {
    @track IMG = panther;
}