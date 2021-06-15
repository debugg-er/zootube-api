import { Column } from "typeorm";
import { ColumnType } from "typeorm/driver/types/ColumnTypes";

/**
 * Used to mark the column of the entity is an calculated column.
 * To make it works, you have to put "<table alias>_" prefix to
 * column alias in .addSelect
 */
export default function VirtualColumn(type: ColumnType): PropertyDecorator {
    return Column({
        type: type,
        select: false,
        insert: false,
        update: false,
        readonly: true,
        nullable: true,
    });
}
