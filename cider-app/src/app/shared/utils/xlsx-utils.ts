
import { EntityField } from 'src/app/data-services/types/entity-field.type';
import { EntityService } from 'src/app/data-services/types/entity-service.type';
import * as XLSX from 'xlsx';

export default class XlsxUtils {

    /**
     * Export the provided records to a CSV file
     * 
     * @param columns 
     * @param records 
     * @param lookups 
     */
    static entityExport<Entity>(columns: EntityField<Entity>[], 
        lookups: Map<EntityService<any, string | number>, Map<string | number, string>>, records: Entity[]) {
        const headers = columns.filter(column => !column.hidden);
        const headerNames = headers.map(column => column.header);
        const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
        records.forEach(record => {
            const values = headers.map(header => {
                if (header.service) {
                    return lookups.get(header.service)?.get(<any>record[header.field]);
                }
                return record[header.field];
            });
            XLSX.utils.sheet_add_aoa(worksheet, [values], {origin: -1});
        });
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        console.log('csv: ', csv);
    }

    /**
     * Import entities from a CSV file
     */
    static entityImport<Entity>(columns: EntityField<Entity>[], 
        lookups: Map<EntityService<any, string | number>, Map<string | number, string>>, file: File) {
        file.arrayBuffer().then(buffer => {
            const workbook: XLSX.WorkBook = XLSX.read(buffer, {type: "buffer"});
            const worksheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
            const parsed = XLSX.utils.sheet_to_json(worksheet);
            console.log('parsed: ', parsed);
        });
    }

}