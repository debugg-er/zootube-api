import { Request, Response, NextFunction } from "express";

export default function asyncHandler(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) {
    const method = descriptor.value;

    descriptor.value = function (req: Request, res: Response, next: NextFunction) {
        return method.apply(this, arguments).catch(next);
    };
}
