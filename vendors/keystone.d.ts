/// <reference types="mongoose" />
/// <reference types="express" />

declare module "keystone" {

    import * as mongoose from 'mongoose';
    import * as express from 'express';

    /**
     * initialies the keystonejs with default options
     * @param options an object containing the object
     */
    export function init(options: any): void

    /**
     * sets the Keystone environment variable
     * @param key the unique key to retrive the stored value
     * @param value the value that is requested to be stored
     */
    function set(key: string, value: any): void;

    /**
     * gets values from the environment with
     * the unique key used for storage
     * @param key unique key used for storing value
     */
    function get(key: string): any;

    /**
     * sets wther keystone should mount admin routes
     */
    let headless: Boolean;

    /**
     * starts the keystone framework to web server
     */
    function start(): void;

    function importer(path: string): Function;

    function pre(t: string, middleware: express.RequestHandler)

    const Field: {

        /**
         * various types of Field defination for admin Ui
         */
        Types: {
            Relationship: mongoose.Types.ObjectId;
            Select: any;
            Boolean: any;
            Code: any;
            Date: any;
            Datetime: any;
            Email: any;
            Key: any;
            Location: any;
            Markdown: any;
            Money: any;
            Name: any;
            Number: any;
            Password: any;
            Text: any;
            Textarea: any;
            TextArray: any;
            Url: any;
            AzureFile: any;
            CloudinaryImage: any;
            S3File: any;
            LocalFile: any;
            Embedly: any;
        }

    }

    const View: any;

    class List {
        /**
         * intializes new keystone list for the database
         *  @param name database collection name
         *  @param options optional configuration for the list
         */
        constructor(name: string, options?: ListOptions)

        /**
         * adds schema conditions tho the keystone list
         * for the underline mongoose schema
         * @param schema list mongoose schema
         */
        add(schema: Object): void;
        add(schema: Object, virtual: string, value: Object): void;
        add(model: string, schema: Object): void;
        add(model: string, schema: Object, virtual: string, value: Object): void;

        /**
         * default columns to be provided for the admin view
         */
        defaultColumnView: string;

        /**
         * registers the view for keystone usage
         */
        register(): void;

        schema: mongoose.Schema;

        defaultSort: string;
        defaultColumns: string;
    }

    function list<T extends mongoose.Document>(name: string): list<T>;
    
    const utils: any;

    const content: any;

    interface ListOptions {
        /** the label used for admin ui in form of key */
        label?: string;

        path?: string;

        track?: boolean;

        index?: boolean;
        
        singular?: string;

        plural?: string;

        drilldown?: string;

        inherits?: string;

        sortable?: boolean;

        nocreate?: boolean;

        noedit?: boolean;

    }

    interface BaseField {
        label?: string;
        required?: boolean;
        initial?: boolean;
        noedit?: boolean;
        note?: string;
        hidden?: boolean;
        collaspe?: boolean;
        dependsOn?: Object;
        watch?: boolean;
        value?: Function;
    }

    interface FieldSpec extends BaseField {
        type: any;
        ref?: string;
        many?: boolean;
        options?: string | Object | Array<{ value: string; label: string; custom: string; }>;
        default?: string | number | Date | Function | Object;
        defaults?: Object;
        filters?: Object;
        path?: string;
        refPath?: string;
        height?: number;
        language?: string;
        displayGravatar?: boolean;
        wysiwgy?: boolean;
        seperator?: string;
        hiddenButtons?: string;
        format?: string | Function;
        currency?: string;
        workfactor?: number;
        numeric?: boolean;
        emptyOption?: boolean;
        filenameFormatter?: Function;
        publicId?: string;
        folder?: string;
        autoCleanup?: string;
        select?: boolean;
        selectPrefix?: string;
        from?: string;
        prefix?: string;
        datePrefix?: string;
        allowedTypes?: string[];
        filename?: Function;
        s3path?: string;
        headless?: Object | Function | Array<{ name: string; value: string }>;
    }

    export interface list<T extends mongoose.Document> {
        model: mongoose.Model<T>
        paginate(options: {
            page: string | number;
            perPage: string | number;
            maxPages: string | number;
        }): mongoose.Model<T>;
    }
}

