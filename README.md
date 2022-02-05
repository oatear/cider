# cider
Card IDE (CIDEr) - Design playing cards using HTML, CSS, and tabular data

## Styling
- Logo: red apple cider bottle
- Colors: red, beige, dark brown

## Interface

### 1. Define card template (HTML, CSS)
- Display existing templates
- Create new template option
- Edit template HTML
- Edit template CSS
- Display template live preview

### 2. Edit tabular card data (CSV, XLSX)
- Display table of existing card data
- Create new field/column option
- Remove existing field/column option
- Inline table row editor
- Remove existing card/row

### 3. Select/Define Print Template (HTML, CSS)
- Display existing templates
- Edit template HTML
- Edit template CSS
- Display template live preview (first x cards)

### 4. Export cards (PDF/PNG)
- Select print template
- Select cards to template
- Export as pdf/png

### 5. Preview cards
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
- Front Template
- Back Template
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

