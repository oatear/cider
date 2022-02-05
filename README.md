# cider
Card IDE (CIDEr) - Design playing cards using HTML, CSS, and tabular data

## Interface

1. Define card template (HTML, CSS)
2. Edit tabular card data (CSV, XLSX)
3. Select/Define Print Template (HTML, CSS)
4. Export cards (PDF/PNG)

Web Application
Angular
PrimeNG


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
### Assets Table
- ID
- Game ID
- File Name

