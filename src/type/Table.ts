interface Table {
    name: string,
    properties: Property[]
}

interface Property {
    name: string,
    id: boolean,
    reference: {
        className: string | undefined,
        cardinality: Cardinality | undefined,
        direction: CardinalityDirection | undefined
    }
}

enum Cardinality {
    none,
    manyToOne = '*',
    oneToOne = '*',
    oneToMany = '*',
    manyToMany = '*'
}

enum CardinalityDirection {
    unidirectional,
    bidirectional,
    selfReferencing = unidirectional
};

export {
    Table,
    Property,
    Cardinality,
    CardinalityDirection
};