import { TranslateService } from "@ngx-translate/core";
import { lastValueFrom, timeout } from "rxjs";
import { EntityField } from "src/app/data-services/types/entity-field.type";

export default class TranslateUtils {

    // Create a translateFields function that takes in an EntityField<Entity>[] and a TranslateService
    // and returns a Promise<EntityField<Entity>[]>
    public static async translateFields<Entity>(fields: EntityField<Entity>[], 
        translateService: TranslateService): Promise<EntityField<Entity>[]> {
        const translatedFields: EntityField<Entity>[] = [];
        for (const field of fields) {
            const translatedField = {...field};
            const translateKeyHeader = `fields.${String(field.field)}`;
            translatedField.header = await lastValueFrom(
                translateService.get(translateKeyHeader).pipe(timeout(1000)))
                .then(translation => translation !== translateKeyHeader ? translation : field.header);
            if (field.description) {
                const translateKeyDesc = `field-descriptions.${String(field.field)}`;
                translatedField.description = await lastValueFrom(
                    translateService.get(translateKeyDesc).pipe(timeout(1000)))
                    .then(translation => translation !== translateKeyDesc ? translation : field.description);
            }
            translatedFields.push(translatedField);
        }
        return translatedFields;
    }
}