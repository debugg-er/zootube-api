export interface File {
    path: string;
    name: string;
    mimetype: string;
    type: string;
}

export interface Files {
    [field: string]: File;
}

export interface Fields {
    [field: string]: string;
}
