# Introduction
Ce module NodeJS indique le tarif EDF courant pour l'option de contrat indiquée (base, hc ou tempo) et l'intensité souscrite. Si le tarif du mois en cours n'est pas encore disponible, c'est le tarif du mois précédent qui est renvoyé.

Les données sont tirées du site officiel http://developpement-durable.bsocom.fr/ qui héberge par ailleurs la base de données [Sit@del2](https://www.insee.fr/fr/metadonnees/definition/c2020)

Une seule méthode est disponible pour l'instant, la méthode 'current'. Elle renvoie un objet JSON contenant :
 * le dernier mois pour lequel un tarif est disponible,
 * le prix de l'abonnement annuel pour l'option et l'intensité souscrite choisie,
 * le prix des différents tarifs pour 100kWh pour l'option et l'intensité souscrite choisie.

Exemple :
 * `{"MONTH":"nov-16","ABO":56.0686,"BASE":15.6435}`
 * `{"MONTH":"nov-16","ABO":100.5141,"HCHP":15.5955,"HCHC":12.7035}`
 * `{"MONTH":"nov-16","ABO":597.2093,"BBRHCJB":10.7475,"BBRHPJB":12.7755,"BBRHCJW":13.9995,"BBRHPJW":16.7355,"BBRHCJR":21.6075,"BBRHPJR":52.1595}`


# Usage

## Installation
```bash
npm install tarifedf
```

## Exemple
```js
var TarifEDF   = require( 'tarifedf' );
var monContrat = new TarifEDF({ 'option' : 'base', 'isousc' : 6 });

monContrat.current( function( err, data) { 
  if( err ) { console.error( err ); process.exit( -1 );}
  console.log( JSON.stringify( data ) );
});
```
