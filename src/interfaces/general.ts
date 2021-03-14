export interface Files {
    [field: string]: {
        path: string;
        name: string;
        mimetype: string;
        type: string;
    };
}

export interface Fields {
    [field: string]: string;
}
