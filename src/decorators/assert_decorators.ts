import * as _ from "lodash";
import { expect } from "chai";
import { Request, Response, NextFunction } from "express";

export function mustInRange(requestKeyPath: string, from: number, to: number) {
    return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = function (req: Request, res: Response, next: NextFunction) {
            const val = +_.get(req, requestKeyPath) || from;
            expect(val, "400:invalid parameter").to.within(from, to);

            return method.apply(this, arguments);
        };
    };
}
