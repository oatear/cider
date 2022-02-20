# cider
Card IDE (CIDEr) - Design playing cards using HTML, CSS, and tabular data

## Styling
- Logo: red apple cider bottle
- Colors: red, beige, dark brown

## Interface

### 1. Define game
- Display existing games
- Create new game

### 2. Define card template (HTML, CSS)
- Display existing templates
- Create new template option
- Edit template HTML
- Edit template CSS
- Display template live preview

### 3. Edit tabular card data (CSV, XLSX)
- Display table of existing card data
- Create new field/column option
- Remove existing field/column option
- Inline table row editor
- Remove existing card/row

### 4. Select/Define Print Template (HTML, CSS)
- Display existing templates
- Edit template HTML
- Edit template CSS
- Display template live preview (first x cards)

### 5. Export cards (PDF/PNG)
- Select print template
- Select cards to template
- Export as pdf/png

### 6. Preview cards
- Scrollable listing of cards
- Cards all rendered

## Web Application
- Angular
- PrimeNG


## Database/Local Storage

### Games Table
- ID
- Name

### Card Templates Table
- ID
- Game ID
- Name
- HTML
- CSS

### Print Templates Table
- ID
- Game ID
- Name
- HTML
- CSS

### Cards Table
- ID
- Game ID
- Front Card Template ID
- Back Card Template ID
- Attributes (JSON)
```
  [{
    field: "title",
    type: "string"
  }]
```

### Card Attributes
- ID
- Game ID
- Field Name
- Type

### Card Attribute Values (Alternative to Attributes JSON)
- Game ID
- Card ID
- Field Name
- Value

### Assets Table
- ID
- Game ID
- File Name

## Generics

### Entity fields definition
```
  fields = [
    {
      field: 'title',
      header: 'Title',
      type: 'string',
      required: true,
      conversion: (entity) => entity.title
    }
  ]

```

### Generic Table (Create/Read/Update/Delete)
Search/sort/filter on a table of entities
Optionally allow CRUD operations
The fields definition from the entity can be overwritten with custom fields

### Generic Editor Modal (Create/Read/Update)
Edit/create new entity dialog


