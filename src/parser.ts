/* eslint-disable curly */
import { Table, Property, Cardinality, CardinalityDirection } from "./type/Table";

const classNameFilter = /class\s+(\w+)\s+{?/; // Get class name of the entity
const mappingAliasFilter = /((M|m)(A|a)(P|p)(P|p)(I|i)(N|n)(G|g))(\s+(as|AS|aS|As)\s+(\w+))?/; // Regex to check if Mapping have an alias and if he have he take it
const propertyNameFilter = /\$(\w+)/; // Get the property name
const relationFilter = '\\(((m|M)(a|A)(n|N)(y|Y)(t|T)(o|O)(o|O)(n|N)(e|E))|((m|M)(a|A)(n|N)(y|Y)(t|T)(o|O)(m|M)(a|A)(n|N)(y|Y))|((o|O)(n|N)(e|E)(t|T)(o|O)(m|M)(a|A)(n|N)(y|Y))|((o|O)(n|N)(e|E)(t|T)(o|O)(o|O)(n|N)(e|E)))';
const relationClassName = /(t|T)(a|A)(r|R)(g|G)(e|E)(t|T)(e|E)(n|N)(t|T)(i|I)(t|T)(y|Y)\s*:\s*(\w+)/;
/**
 * 
 * @param fileAst file parsed in ast expected
 * @returns name of the class
 */
function getClassName(file: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        try {
            resolve(file.match(classNameFilter)?.[1]);
        } catch (err) {
            reject(__filename + " : " + err);
        }
    });
}


/**
 * 
 * @param fileAst file parsed in ast expected
 * @returns an array of type Property
 */
function getProperties(file: string): Promise<Property[]> {
    return new Promise((resolve, reject) => {
        try {
            const fileSplit = file.split("\n");
            let properties: Property[] = [];
            let property: Property = { name: "undefined", id: false, reference: {
                className: undefined,
                cardinality: undefined,
                direction: undefined
            }};
            let alias: string | undefined = "";
            let relationAliasFilter: RegExp;
            let getNextValue = false;

            if (mappingAliasFilter.test(file)) {
                const mapping = file.match(mappingAliasFilter);

                alias = (mapping?.[11]) ? mapping?.[11] : mapping?.[1];
            }

            if (alias !== undefined) {
                relationAliasFilter = new RegExp(`${alias}\\${relationFilter}`);
            }

            fileSplit.forEach(line => {
                // if id found set id to true
                if (line.indexOf(`${alias}\\Id`) !== -1) {
                    property.id = true;
                }
                if (line.indexOf(`${alias}`) !== -1) {
                    getNextValue = true;
                }

                if (relationAliasFilter.test(line)) {
                    const relation = line.match(relationAliasFilter)?.[1].toLowerCase();

                    switch (relation) {
                        case "manytoone":
                            property.reference.cardinality = Cardinality.manyToOne;
                        break;
                        case "manytomany":
                            property.reference.cardinality = Cardinality.manyToMany;
                        break;
                        case "onetomany":
                            property.reference.cardinality = Cardinality.oneToMany;
                        break;
                        case "onetoone":
                            property.reference.cardinality = Cardinality.oneToOne;
                        break;
                    }

                    if(relationClassName.test(line)) {
                        property.reference.className = ((line.match(relationClassName)?.[12] !== undefined)? line.match(relationClassName)?.[13] : undefined);
                    }
                }

                if (!getNextValue) return;


                if (propertyNameFilter.test(line)) {
                    const variable = (line.match(propertyNameFilter)?.[1] === "this") ? "" : line.match(propertyNameFilter)?.[1]; // To get only properties of the class

                    if (variable === "") return; // return if variable is not a properties

                    property.name = (variable === undefined) ? "undefined" : variable;

                    getNextValue = false;
                    properties.push(property);
                    property = { name: "undefined", id: false, reference: {
                        className: undefined,
                        cardinality: undefined,
                        direction: undefined
                    }};

                }
            });


            resolve(properties);
        }
        catch (err) {
            reject(__filename + " : " + err);
        }
    });

}


function parseFile(content: string): Promise<Table> {
    return new Promise((resolve, reject) => {
        try {
            getProperties(content).then(properties => {
                getClassName(content).then(className => {

                    const table: Table = {
                        name: (className) ? className : "undefined",
                        properties: properties
                    };

                    resolve(table);
                });
            });
        } catch (err) {
            reject(__filename + " : " + err);
        }

    });
}


function parseFiles(contents: string[]): Promise<Table[]> {
    return new Promise((resolve, reject) => {
        try {
            let promises: Promise<Table>[] = [];

            contents.forEach(content => {
                promises.push(parseFile(content).catch(() => {
                    throw new Error("error in parseFile function");
                }));
            });


            Promise.all(promises).then(result => {
                resolve(result);
            });


        } catch (err) {
            reject(__filename + " : " + err);
        }
    });
}

export {
    parseFile,
    parseFiles
};
