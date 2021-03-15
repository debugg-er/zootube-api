const vietnameseCharacters =
    "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ";

export const nameRegex = new RegExp(`^\\b[ a-zA-Z${vietnameseCharacters}]+\\b$`);
export const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9\._]{5,31}$/;
export const passwordRegex = /^\S{6,32}$/;
export const urlPathRegex = /^(\/[a-zA-Z0-9.]+)+\b$/;
export const jwtRegex = /^[A-Za-z]+ [A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

export const listRegex = /^[^,]+(,[^,]+)*?$/;
