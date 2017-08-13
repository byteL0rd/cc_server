import * as keystone from 'keystone'
import * as mongoose from 'mongoose';

var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Enquiry = new keystone.List('Enquiry', {
	nocreate: true,
	noedit: true,
});

Enquiry.add({
	name: <keystone.FieldSpec>{ type: Types.Name, required: true },
	email: <keystone.FieldSpec>{ type: Types.Email, required: true },
	phone: <keystone.FieldSpec>{ type: String },
	enquiryType: <keystone.FieldSpec>{ type: Types.Select, options: [
		{ value: 'message', label: 'Just leaving a message' },
		{ value: 'question', label: 'I\'ve got a question' },
		{ value: 'other', label: 'Something else...' },
	] },
	message: <keystone.FieldSpec>{ type: Types.Markdown, required: true },
	createdAt: <keystone.FieldSpec>{ type: Date, default: Date.now },
});

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, enquiryType, createdAt';
Enquiry.register();
