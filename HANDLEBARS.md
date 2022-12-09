# 1 Template - Language Reference

## 1.1 Built-in Handlebars Helpers
[Built-in helpers reference](https://handlebarsjs.com/guide/builtin-helpers.html)

## 1.2 Card Attributes and Assets

### Card Attributes
Reference any card attribute (names are in kebab case 
Ex. 'Mystic Power' -> 'mystic-power').

    {{card.mystic-power}}

### Assets
Reference any asset (names are in kebab case 
Ex. 'Apple Image' -> 'apple-image').

    <img src="{{assets.apple-image}}"/>

## 1.3 Basic Helpers

### Index {{index}}
Index an object/array with another variable (Ex. assets[card.image]).

    {{index assets card.image}}

### Compile Images {{compileImages}}
Compile text containing `{{asset-name [multiples]}}` variables.

    {{compileImages card.description width=100}}

Ex. Description Field

    Draw {{red-card 2}}, discard {{red-card}}.

![image-1]

## 1.4 Control Helpers

### Repeat {{repeat}}
Repeat the contained HTML `n` number of times.

    {{#repeat 5}}
        Any arbitrary HTML
    {{/repeat}}

## 1.5 Boolean Helpers

### AND {{and}}

    {{#if (and (eq card.type "mystic") (gt card.power 4))}}
    {{/if}}

### OR {{or}}

    {{#if (or (eq card.type "mystic") (gt card.power 4))}}
    {{/if}}

## 1.6 Comparison Helpers

### Equal {{eq}}

    {{#if (eq card.type 'mystic')}}
    {{/if}}

### Greater Than {{gt}}

    {{#if (gt card.power 5)}}
    {{/if}}
    
### Greater Than or Equal to{{gte}}

    {{#if (gte card.power 5)}}
    {{/if}}

### Less Than {{lt}}

    {{#if (lt card.power 4)}}
    {{/if}}
    
### Less Than or Equal to {{lte}}

    {{#if (lte card.power 4)}}
    {{/if}}

## 1.7 String Helpers

### Concatenate {{concat}}

    {{concat card.type "-experience"}}

### Kebab-Case {{kebabcase}}

    {{kebabcase "Clear Orb"}}

### Upper-Case {{uppercase}}

    {{uppercase "Clear Orb"}}
    
### Lower-Case {{lowercase}}

    {{lowercase "Clear Orb"}}

### Pad Zeros {{padZeroes}}
Pad a given number by `n` zeros.

    {{padZeros card.id 3}}

## 1.8 Math Helpers

### Add {{add}}

    {{add card.power 2}}

### Subtract {{sub}}

    {{sub card.power 2}}

### Multiply {{multiply}}

    {{multiply card.power 2}}

### Divide {{divide}}

    {{divide card.power 2}}

### Ceiling {{ceil}}

    {{ceil card.power}}

### Floor {{floor}}

    {{floor card.power}}

### Absolute Value {{abs}}

    {{abs card.power}}


[image-1]: cider-app/src/assets/image-1.png